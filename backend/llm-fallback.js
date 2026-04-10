import Anthropic from "@anthropic-ai/sdk";

// ── Shared Claude Client ───────────────────────────────────
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert supply chain optimization consultant. You analyze network topologies, transportation lanes, inventory positions, and demand patterns to provide actionable recommendations. Always respond with structured JSON when asked for data, and use specific numbers and percentages. Focus on: total landed cost, OTIF (On-Time In-Full), lead time, inventory turns, disruption risk, and network resilience.`;

const MODEL = "claude-sonnet-4-20250514";

// ── Shared utility: call Claude and parse JSON from response ──
async function callClaude(prompt, { maxTokens = 2048, retries = 2 } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      });

      const responseText =
        message.content[0].type === "text" ? message.content[0].text : "";

      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return { data: JSON.parse(jsonMatch[0]), raw: responseText };
        } catch {
          return { data: null, raw: responseText };
        }
      }

      return { data: null, raw: responseText };
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        // Exponential backoff
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}

// ── Generate Scenario Decisions ───────────────────────────
export async function generateScenarioWithLLM(scenarioType, networkContext) {
  const prompt = `Generate a detailed ${scenarioType} supply chain optimization scenario.

Network Context:
${JSON.stringify(networkContext, null, 2)}

Respond with a JSON object containing:
{
  "decisions": [{ "type": "lane_allocation|source_switch|capacity_change", "description": "...", "impact_usd": 0, "confidence": 0.0-1.0 }],
  "cost_impact_pct": -5.0,
  "service_impact_pct": 2.0,
  "implementation_phases": [{ "phase": 1, "weeks": 4, "actions": ["..."] }],
  "risks": [{ "risk": "...", "probability": "low|medium|high", "mitigation": "..." }],
  "estimated_savings_usd": 150000
}`;

  const { data, raw } = await callClaude(prompt);
  return data || { raw_response: raw };
}

// ── Analyze Network ───────────────────────────────────────
export async function analyzeNetworkWithLLM(networkData) {
  const prompt = `Analyze this supply chain network and identify optimization opportunities.

Network Data:
${JSON.stringify(networkData, null, 2)}

Respond with a JSON object containing:
{
  "cost_opportunities": [{ "description": "...", "savings_usd": 0, "effort": "low|medium|high" }],
  "service_risks": [{ "description": "...", "severity": "low|medium|high", "affected_nodes": [] }],
  "bottlenecks": [{ "node": "...", "issue": "...", "recommendation": "..." }],
  "recommendations": [{ "priority": 1, "action": "...", "impact": "..." }],
  "network_score": 78
}`;

  const { data, raw } = await callClaude(prompt, { maxTokens: 1500 });
  return data || { raw_response: raw };
}

// ── Estimate KPI Impacts ─────────────────────────────────
export async function estimateKPIsWithLLM(scenarioDecisions, baselineKPIs) {
  const prompt = `Estimate the KPI impact of these supply chain decisions against the baseline.

Decisions: ${JSON.stringify(scenarioDecisions, null, 2)}
Baseline KPIs: ${JSON.stringify(baselineKPIs, null, 2)}

Respond with a JSON object:
{
  "estimated_total_cost": 2700000,
  "estimated_otif": 95.5,
  "estimated_lead_time": 8.2,
  "estimated_inventory_turns": 11.5,
  "confidence_level": 0.82,
  "reasoning": "..."
}`;

  const { data, raw } = await callClaude(prompt, { maxTokens: 1000 });
  return data || { raw_response: raw };
}
