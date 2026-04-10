import express from "express";
import cors from "cors";

import dataIngestion from "./data-ingestion.js";
import kpiCalculation from "./kpi-calculation.js";
import { generateScenarioWithLLM, analyzeNetworkWithLLM } from "./llm-fallback.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ── Environment Validation ───────────────────────────────
const requiredVars = ["DATABASE_URL"];
const optionalVars = ["ANTHROPIC_API_KEY"];

for (const v of requiredVars) {
  if (!process.env[v]) {
    console.warn(`⚠️  Missing required env var: ${v} — DB endpoints will fail`);
  }
}
for (const v of optionalVars) {
  if (!process.env[v]) {
    console.warn(`ℹ️  Missing optional env var: ${v} — LLM features disabled`);
  }
}

// ── Wrap Vercel-style handlers into Express routes ───────
function wrapHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error(`API Error: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    }
  };
}

// ── Routes ───────────────────────────────────────────────
app.post("/api/data-ingestion", wrapHandler(dataIngestion));
app.post("/api/kpi-calculation", wrapHandler(kpiCalculation));

// Scenario creation (with optional LLM fallback)
app.post("/api/scenarios", async (req, res) => {
  try {
    const { name, scenario_type, use_llm_fallback, network_context } = req.body;

    if (!name || !scenario_type) {
      return res.status(400).json({ error: "name and scenario_type are required" });
    }

    let decisions = null;
    if (use_llm_fallback && process.env.ANTHROPIC_API_KEY) {
      decisions = await generateScenarioWithLLM(scenario_type, network_context || {});
    }

    res.status(200).json({
      success: true,
      scenario: { name, scenario_type, status: "draft" },
      llm_generated: !!decisions,
      decisions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Network analysis
app.post("/api/analyze-network", async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(400).json({ error: "ANTHROPIC_API_KEY not configured" });
    }
    const analysis = await analyzeNetworkWithLLM(req.body);
    res.status(200).json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: !!process.env.DATABASE_URL,
    llm: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// ── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Supply Chain Analyst API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
