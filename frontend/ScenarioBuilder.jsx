import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Zap, Sparkles } from "lucide-react";
import GlassCard from "./components/GlassCard";
import { demoScenarios, currentKPIs } from "./data/mockData";

const scenarioTypes = [
  { id: "baseline", name: "Baseline", desc: "Current state snapshot", icon: "📊", color: "#747474" },
  { id: "cost_down", name: "Cost-Down", desc: "Optimize total landed cost", icon: "💰", color: "#2E844A" },
  { id: "service_up", name: "Service-Up", desc: "Improve OTIF & lead times", icon: "🚀", color: "#0176D3" },
  { id: "resilience_up", name: "Resilience-Up", desc: "Add redundancy & backup", icon: "🛡️", color: "#9050E9" },
];

const formatCurrency = (v) => `$${(v / 1_000_000).toFixed(2)}M`;

export default function ScenarioBuilder() {
  const [scenarios, setScenarios] = useState(demoScenarios);
  const [selectedType, setSelectedType] = useState("cost_down");
  const [name, setName] = useState("");
  const [useLLM, setUseLLM] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);

    await new Promise((r) => setTimeout(r, 1500));

    const newScenario = {
      id: `sc${Date.now()}`,
      name,
      type: selectedType,
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0],
      kpis: {
        cost: currentKPIs.totalLandedCost * (selectedType === "cost_down" ? 0.93 : selectedType === "resilience_up" ? 1.04 : 1),
        otif: currentKPIs.otifPercentage * (selectedType === "service_up" ? 1.03 : 1),
        leadTime: currentKPIs.avgLeadTimeDays * (selectedType === "service_up" ? 0.88 : 1),
        turns: currentKPIs.inventoryTurns * (selectedType === "cost_down" ? 1.05 : 1),
      },
    };

    setScenarios((prev) => [newScenario, ...prev]);
    setName("");
    setCreating(false);
    setShowForm(false);
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Scenarios</h1>
          <p>Build and compare supply chain optimization scenarios</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <FlaskConical size={16} />
          {showForm ? "Cancel" : "New Scenario"}
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", marginBottom: 20 }}
          >
            <GlassCard style={{ padding: 20 }} accent>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#181818", marginBottom: 16 }}>Create New Scenario</h3>

              <div className="scenario-types">
                {scenarioTypes.map((t) => (
                  <div
                    key={t.id}
                    className={`scenario-type-card ${selectedType === t.id ? "selected" : ""}`}
                    onClick={() => setSelectedType(t.id)}
                  >
                    <div className="type-icon">{t.icon}</div>
                    <div className="type-name">{t.name}</div>
                    <div className="type-desc">{t.desc}</div>
                  </div>
                ))}
              </div>

              <div className="input-group">
                <label htmlFor="scenario-name">Scenario Name</label>
                <input
                  id="scenario-name"
                  className="input-field"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Vietnam Expansion Q3"
                />
              </div>

              <div className="input-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={useLLM} onChange={(e) => setUseLLM(e.target.checked)} />
                  <Sparkles size={15} style={{ color: "#9050E9" }} />
                  Use AI to auto-generate optimization decisions
                </label>
              </div>

              <button className="btn btn-primary btn-lg" onClick={handleCreate} disabled={creating || !name.trim()}>
                {creating ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Zap size={16} />
                    </motion.span>
                    Generating...
                  </>
                ) : (
                  <>
                    <FlaskConical size={16} />
                    Create Scenario
                  </>
                )}
              </button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scenario Comparison Table */}
      <GlassCard style={{ padding: 20 }} accent>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#181818", marginBottom: 12 }}>Scenario Comparison</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Type</th>
                <th>Status</th>
                <th>Total Cost</th>
                <th>OTIF %</th>
                <th>Lead Time</th>
                <th>Inv. Turns</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((sc, i) => {
                const typeInfo = scenarioTypes.find((t) => t.id === sc.type) || scenarioTypes[0];
                const costDelta = ((sc.kpis.cost - currentKPIs.totalLandedCost) / currentKPIs.totalLandedCost * 100).toFixed(1);
                const otifDelta = (sc.kpis.otif - currentKPIs.otifPercentage).toFixed(1);

                return (
                  <motion.tr
                    key={sc.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td style={{ fontWeight: 600 }}>{sc.name}</td>
                    <td>
                      <span className="badge" style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}>
                        {typeInfo.icon} {typeInfo.name}
                      </span>
                    </td>
                    <td>
                      <span className="flex items-center gap-2">
                        <span className={`status-dot ${sc.status === "active" ? "active" : ""}`}
                          style={{ background: sc.status === "active" ? "#2E844A" : "#969492" }}
                        />
                        <span style={{ textTransform: "capitalize" }}>{sc.status}</span>
                      </span>
                    </td>
                    <td>
                      <span>{formatCurrency(sc.kpis.cost)}</span>
                      <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: costDelta < 0 ? "#2E844A" : costDelta > 0 ? "#C23934" : "#969492" }}>
                        {costDelta > 0 ? "+" : ""}{costDelta}%
                      </span>
                    </td>
                    <td>
                      <span>{sc.kpis.otif.toFixed(1)}%</span>
                      <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: otifDelta > 0 ? "#2E844A" : otifDelta < 0 ? "#C23934" : "#969492" }}>
                        {otifDelta > 0 ? "+" : ""}{otifDelta}
                      </span>
                    </td>
                    <td>{sc.kpis.leadTime.toFixed(1)}d</td>
                    <td>{sc.kpis.turns.toFixed(1)}</td>
                    <td style={{ color: "#969492" }}>{sc.createdAt}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
