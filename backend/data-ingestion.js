import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const insertQueries = {
  nodes: {
    sql: `INSERT INTO nodes (name, type, country, latitude, longitude, capacity_units, capacity_periodicity)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT DO NOTHING`,
    params: (r) => [r.name, r.type, r.country, r.latitude, r.longitude, r.capacity_units, r.capacity_periodicity],
  },
  lanes: {
    sql: `INSERT INTO lanes (origin_node_id, destination_node_id, mode, transit_time_days, frequency_per_week, cost_per_unit, cost_per_container, min_order_qty, capacity_units_per_period, incoterm)
          VALUES (
            (SELECT id FROM nodes WHERE name = $1 LIMIT 1),
            (SELECT id FROM nodes WHERE name = $2 LIMIT 1),
            $3, $4, $5, $6, $7, $8, $9, $10
          )
          ON CONFLICT DO NOTHING`,
    params: (r) => [r.origin, r.destination, r.mode, r.transit_time_days, r.frequency_per_week, r.cost_per_unit, r.cost_per_container, r.min_order_qty, r.capacity_units_per_period, r.incoterm],
  },
  skus: {
    sql: `INSERT INTO skus (sku_code, description, unit_cost, weight_kg, volume_m3, tariff_code, duty_rate)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (sku_code) DO UPDATE SET
            description = EXCLUDED.description,
            unit_cost = EXCLUDED.unit_cost,
            weight_kg = EXCLUDED.weight_kg`,
    params: (r) => [r.sku_code, r.description, r.unit_cost, r.weight_kg, r.volume_m3, r.tariff_code, r.duty_rate],
  },
  demand: {
    sql: `INSERT INTO demand (sku_id, destination_node_id, demand_date, qty_units, confidence_level)
          VALUES (
            (SELECT id FROM skus WHERE sku_code = $1 LIMIT 1),
            (SELECT id FROM nodes WHERE name = $2 LIMIT 1),
            $3, $4, $5
          )`,
    params: (r) => [r.sku_code, r.destination, r.demand_date, r.qty_units, r.confidence_level || "medium"],
  },
  inventory: {
    sql: `INSERT INTO inventory (sku_id, node_id, qty_on_hand, safety_stock_qty, reorder_point_qty)
          VALUES (
            (SELECT id FROM skus WHERE sku_code = $1 LIMIT 1),
            (SELECT id FROM nodes WHERE name = $2 LIMIT 1),
            $3, $4, $5
          )
          ON CONFLICT (sku_id, node_id) DO UPDATE SET
            qty_on_hand = EXCLUDED.qty_on_hand,
            safety_stock_qty = EXCLUDED.safety_stock_qty,
            reorder_point_qty = EXCLUDED.reorder_point_qty,
            last_updated = CURRENT_TIMESTAMP`,
    params: (r) => [r.sku_code, r.node, r.qty_on_hand, r.safety_stock_qty, r.reorder_point_qty],
  },
  supplier_skus: {
    sql: `INSERT INTO supplier_skus (supplier_node_id, sku_id, lead_time_days, moq, is_single_source, disruption_risk_score)
          VALUES (
            (SELECT id FROM nodes WHERE name = $1 LIMIT 1),
            (SELECT id FROM skus WHERE sku_code = $2 LIMIT 1),
            $3, $4, $5, $6
          )
          ON CONFLICT DO NOTHING`,
    params: (r) => [r.supplier, r.sku_code, r.lead_time_days, r.moq, r.is_single_source || false, r.disruption_risk_score],
  },
};

const validTypes = Object.keys(insertQueries);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { data_type, records } = req.body;

    if (!data_type || !validTypes.includes(data_type)) {
      return res.status(400).json({
        error: `Invalid data_type. Must be one of: ${validTypes.join(", ")}`,
      });
    }
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: "records must be a non-empty array" });
    }

    const queryDef = insertQueries[data_type];
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      let inserted = 0;
      let errors = [];

      for (const record of records) {
        try {
          await client.query(queryDef.sql, queryDef.params(record));
          inserted++;
        } catch (err) {
          errors.push({ record, error: err.message });
        }
      }

      await client.query("COMMIT");
      res.status(200).json({
        success: true,
        data_type,
        inserted,
        total: records.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
