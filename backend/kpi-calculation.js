import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { scenario_id } = req.body;
    if (!scenario_id) return res.status(400).json({ error: "scenario_id required" });

    const client = await pool.connect();
    try {
      // ── Total Landed Cost ──────────────────────────────────────────
      // Sum of (allocation_qty × lane cost_per_unit) for all decisions in this scenario,
      // plus estimated duties and warehousing overhead
      const costRes = await client.query(
        `SELECT
           COALESCE(SUM(sd.allocation_qty * l.cost_per_unit), 0) AS transport_cost,
           COALESCE(SUM(sd.allocation_qty * COALESCE(s.duty_rate, 0) / 100 * COALESCE(s.unit_cost, 0)), 0) AS duty_cost,
           COALESCE(SUM(sd.allocation_qty), 0) AS total_units
         FROM scenario_decisions sd
         LEFT JOIN lanes l ON l.origin_node_id = sd.origin_node_id AND l.destination_node_id = sd.destination_node_id
         LEFT JOIN skus s ON s.id = sd.sku_id
         WHERE sd.scenario_id = $1`,
        [scenario_id]
      );

      const { transport_cost, duty_cost, total_units } = costRes.rows[0];
      const warehousingRate = 0.85; // $/unit/period
      const warehouseCost = total_units * warehousingRate;
      const totalLandedCost = parseFloat(transport_cost) + parseFloat(duty_cost) + warehouseCost;

      // ── OTIF % ─────────────────────────────────────────────────────
      // Fulfilled qty / demanded qty, weighted by on-time lane transit
      const otifRes = await client.query(
        `SELECT
           COALESCE(SUM(sd.allocation_qty), 0) AS fulfilled,
           COALESCE((SELECT SUM(d.qty_units) FROM demand d), 0) AS demanded
         FROM scenario_decisions sd
         WHERE sd.scenario_id = $1`,
        [scenario_id]
      );

      const fulfilled = parseFloat(otifRes.rows[0].fulfilled) || 0;
      const demanded = parseFloat(otifRes.rows[0].demanded) || 1;
      const otifPercentage = Math.min(100, (fulfilled / demanded) * 100);

      // ── Average Lead Time ──────────────────────────────────────────
      // Weighted average of lane transit times by allocation qty
      const leadTimeRes = await client.query(
        `SELECT
           CASE WHEN SUM(sd.allocation_qty) > 0 THEN
             SUM(sd.allocation_qty * COALESCE(l.transit_time_days, 0)) / SUM(sd.allocation_qty)
           ELSE 0 END AS weighted_lead_time
         FROM scenario_decisions sd
         LEFT JOIN lanes l ON l.origin_node_id = sd.origin_node_id AND l.destination_node_id = sd.destination_node_id
         WHERE sd.scenario_id = $1`,
        [scenario_id]
      );

      const leadTimeAvgDays = parseFloat(leadTimeRes.rows[0].weighted_lead_time) || 0;

      // ── Inventory Turns ────────────────────────────────────────────
      // Annual demand value / average inventory value
      const turnsRes = await client.query(
        `SELECT
           COALESCE(SUM(d.qty_units * s.unit_cost), 0) AS annual_demand_value,
           COALESCE(SUM(i.qty_on_hand * s.unit_cost), 0) AS avg_inventory_value
         FROM skus s
         LEFT JOIN demand d ON d.sku_id = s.id
         LEFT JOIN inventory i ON i.sku_id = s.id`
      );

      const annualDemandValue = parseFloat(turnsRes.rows[0].annual_demand_value) || 0;
      const avgInventoryValue = parseFloat(turnsRes.rows[0].avg_inventory_value) || 1;
      const inventoryTurns = annualDemandValue / avgInventoryValue;

      // ── Store Results ──────────────────────────────────────────────
      const kpiRecords = [
        { name: "total_landed_cost", value: totalLandedCost, unit: "USD" },
        { name: "otif", value: otifPercentage, unit: "%" },
        { name: "lead_time_avg", value: leadTimeAvgDays, unit: "days" },
        { name: "inventory_turns", value: inventoryTurns, unit: "per_year" },
      ];

      // Clear old results for this scenario
      await client.query(`DELETE FROM kpi_results WHERE scenario_id = $1`, [scenario_id]);

      for (const kpi of kpiRecords) {
        await client.query(
          `INSERT INTO kpi_results (scenario_id, kpi_name, kpi_value, kpi_unit) VALUES ($1, $2, $3, $4)`,
          [scenario_id, kpi.name, kpi.value, kpi.unit]
        );
      }

      res.status(200).json({
        success: true,
        kpis: {
          total_landed_cost: totalLandedCost,
          otif_percentage: otifPercentage,
          lead_time_avg_days: leadTimeAvgDays,
          inventory_turns_per_year: inventoryTurns,
        },
        breakdown: {
          transport_cost: parseFloat(transport_cost),
          duty_cost: parseFloat(duty_cost),
          warehouse_cost: warehouseCost,
          total_units: parseFloat(total_units),
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
