import React from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { DollarSign, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import KPICard from "./components/KPICard";
import GlassCard from "./components/GlassCard";
import {
  currentKPIs, kpiTrends, costBreakdown, serviceLevels, leadTimeDistribution,
} from "./data/mockData";

const formatCurrency = (v) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #E5E5E5",
      borderRadius: 8, padding: "10px 14px", boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
    }}>
      <p style={{ color: "#181818", fontWeight: 600, marginBottom: 4, fontSize: 13 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 12 }}>
          {p.name}: {p.name === "Cost" ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function KPIDashboard() {
  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Supply chain performance metrics and analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          icon={<DollarSign size={20} />}
          label="Total Landed Cost"
          value={formatCurrency(currentKPIs.totalLandedCost)}
          trend={-2.3}
          trendLabel="vs last quarter"
          color="teal"
          delay={0}
        />
        <KPICard
          icon={<CheckCircle2 size={20} />}
          label="OTIF Score"
          value={`${currentKPIs.otifPercentage}%`}
          trend={1.8}
          trendLabel="vs last quarter"
          color="blue"
          delay={0.06}
        />
        <KPICard
          icon={<Clock size={20} />}
          label="Avg Lead Time"
          value={`${currentKPIs.avgLeadTimeDays} days`}
          trend={-5.4}
          trendLabel="improvement"
          color="amber"
          delay={0.12}
        />
        <KPICard
          icon={<RefreshCw size={20} />}
          label="Inventory Turns"
          value={currentKPIs.inventoryTurns}
          trend={3.7}
          trendLabel="vs last year"
          color="purple"
          delay={0.18}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid">
        <GlassCard className="chart-container" accent>
          <h3>Cost Trend</h3>
          <p className="chart-subtitle">Monthly total landed cost — trailing 12 months</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={kpiTrends}>
              <defs>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0176D3" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0176D3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="month" tick={{ fill: "#969492", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#969492", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cost" name="Cost" stroke="#0176D3" strokeWidth={2} fill="url(#costGrad)" dot={false} activeDot={{ r: 4, fill: "#0176D3", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="chart-container" accent>
          <h3>OTIF Performance</h3>
          <p className="chart-subtitle">On-Time In-Full delivery rate</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={kpiTrends}>
              <defs>
                <linearGradient id="otifGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E844A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2E844A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="month" tick={{ fill: "#969492", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[88, 100]} tick={{ fill: "#969492", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="otif" name="OTIF %" stroke="#2E844A" strokeWidth={2} fill="url(#otifGrad)" dot={false} activeDot={{ r: 4, fill: "#2E844A", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid">
        <GlassCard className="chart-container" accent>
          <h3>Cost Breakdown</h3>
          <p className="chart-subtitle">Landed cost composition by category</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={costBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={2}
                dataKey="value"
                nameKey="category"
                stroke="#fff"
                strokeWidth={2}
              >
                {costBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div style={{
                      background: "#fff", border: "1px solid #E5E5E5",
                      borderRadius: 8, padding: "10px 14px", boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                    }}>
                      <p style={{ color: "#181818", fontWeight: 600, fontSize: 13 }}>{d.category}</p>
                      <p style={{ color: d.color, fontSize: 12 }}>{formatCurrency(d.value)}</p>
                    </div>
                  );
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ color: "#706E6B", fontSize: 11 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="chart-container" accent>
          <h3>Lead Time Distribution</h3>
          <p className="chart-subtitle">Shipment lead time buckets</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={leadTimeDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="range" tick={{ fill: "#969492", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#969492", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Shipments" radius={[4, 4, 0, 0]} fill="#9050E9" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Service Level Table */}
      <GlassCard className="chart-container" accent>
        <h3>Service Level by Location</h3>
        <p className="chart-subtitle">OTIF performance across distribution nodes</p>
        <table className="data-table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Location</th>
              <th>OTIF %</th>
              <th>Orders</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {serviceLevels.map((s, i) => (
              <motion.tr
                key={s.node}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
              >
                <td style={{ fontWeight: 600 }}>{s.node}</td>
                <td>{s.otif}%</td>
                <td>{s.orders.toLocaleString()}</td>
                <td>
                  <span className={`badge ${s.otif >= 95 ? "badge-teal" : s.otif >= 93 ? "badge-amber" : "badge-rose"}`}>
                    {s.otif >= 95 ? "Excellent" : s.otif >= 93 ? "Good" : "At Risk"}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
