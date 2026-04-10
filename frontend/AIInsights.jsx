import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Trash2, Bot, User } from "lucide-react";
import GlassCard from "./components/GlassCard";

const presetPrompts = [
  { label: "🔍 Bottleneck Analysis", prompt: "Analyze our supply chain network for bottlenecks and single points of failure." },
  { label: "💰 Cost Opportunities", prompt: "Identify the top 5 cost reduction opportunities in our current network." },
  { label: "⚠️ Risk Assessment", prompt: "Assess disruption risks across suppliers and recommend mitigation strategies." },
  { label: "📊 Lane Optimization", prompt: "Which transportation lanes are underutilized and could be consolidated?" },
  { label: "🏭 Capacity Planning", prompt: "Evaluate warehouse capacity utilization and forecast when we'll need expansion." },
  { label: "🌍 Network Redesign", prompt: "Suggest an optimized network design that reduces cost while maintaining 95% OTIF." },
];

const demoResponses = {
  bottleneck: `## Network Bottleneck Analysis

**Critical Finding:** Your Los Angeles Hub handles **76% of all inbound ocean freight** (25,500 of 33,500 units), making it the primary single point of failure.

### Top 3 Bottlenecks Identified:

1. **Los Angeles Hub Concentration** — Risk Score: High
   - 4 of 4 supplier lanes flow through LA
   - Any port disruption halts US distribution entirely
   - Recommendation: Add an East Coast hub (e.g., Savannah or Newark)

2. **Shanghai Port Dependency** — Risk Score: Medium
   - 47% of total sourced volume originates from Shanghai
   - Recommendation: Shift 15-20% of volume to Ho Chi Minh alternate lane

3. **Dallas → SF Single Lane** — Risk Score: Medium
   - San Francisco market served by only one warehouse lane
   - Recommendation: Add a direct Chicago → SF rail lane as backup

### Impact Estimate:
Implementing these changes would reduce single-point-of-failure risk by **62%** at an estimated cost increase of **3.2%**.`,

  cost: `## Top 5 Cost Reduction Opportunities

Based on your current network with **$2.85M total landed cost**, here are actionable savings:

| # | Opportunity | Est. Savings | Effort |
|---|-------------|-------------|--------|
| 1 | Shift 20% volume from ocean to rail (Shanghai → Rotterdam) | $142K (5.0%) | Medium |
| 2 | Consolidate Dallas & Chicago WH shipments to NYC | $68K (2.4%) | Low |
| 3 | Renegotiate Shenzhen ocean freight (volume leverage) | $54K (1.9%) | Low |
| 4 | Nearshore 15% of VN production to Mexico | $89K (3.1%) | High |
| 5 | Optimize safety stock levels at Frankfurt WH | $31K (1.1%) | Low |

**Total potential savings: $384K (13.5% of TLC)**

Quick wins (#2, #3, #5) can be implemented within 30 days for $153K in savings.`,

  default: `## Supply Chain Analysis

I've analyzed your network with **12 nodes**, **14 active lanes**, and **$2.85M** total landed cost.

### Key Findings:
- Network efficiency score: 78/100
- Average lane utilization: 67%
- Service level: 94.2% OTIF (target: 95%)

### Recommendations:
1. Increase Vietnam sourcing by 15% to reduce overall cost per unit
2. Add a backup ocean lane from Mumbai to Los Angeles for resilience
3. Optimize inventory levels — Chicago WH carrying 18% excess safety stock

Would you like me to dive deeper into any of these areas?`,
};

export default function AIInsights() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome! I can analyze your supply chain network, identify optimization opportunities, and help you build better scenarios. Choose an analysis type above or type your own question.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1800));

    let response;
    const lower = text.toLowerCase();
    if (lower.includes("bottleneck") || lower.includes("failure")) {
      response = demoResponses.bottleneck;
    } else if (lower.includes("cost") || lower.includes("saving") || lower.includes("reduction")) {
      response = demoResponses.cost;
    } else {
      response = demoResponses.default;
    }

    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([
      { role: "assistant", content: "Chat cleared. How can I help you analyze your supply chain?" },
    ]);
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>AI Insights</h1>
          <p>Ask questions about your supply chain network</p>
        </div>
        <button className="btn btn-ghost" onClick={clearChat}>
          <Trash2 size={16} /> Clear
        </button>
      </div>

      {/* Preset Prompts */}
      <div className="prompt-chips">
        {presetPrompts.map((p) => (
          <button key={p.label} className="prompt-chip" onClick={() => sendMessage(p.prompt)}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <GlassCard style={{ overflow: "hidden" }} accent>
        <div className="chat-messages" ref={chatRef} style={{ minHeight: 400 }}>
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                className={`chat-message ${msg.role}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-2" style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                  color: msg.role === "user" ? "rgba(255,255,255,0.7)" : "#969492",
                }}>
                  {msg.role === "assistant" ? <Bot size={12} /> : <User size={12} />}
                  {msg.role === "assistant" ? "Analyst" : "You"}
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              className="chat-message assistant"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-2" style={{ color: "#969492" }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  style={{ display: "flex" }}
                >
                  <Sparkles size={14} />
                </motion.div>
                Analyzing your network...
              </div>
            </motion.div>
          )}
        </div>

        <div className="chat-input-row">
          <input
            className="input-field"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask about your supply chain..."
            disabled={loading}
          />
          <button className="btn btn-primary" onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>
            <Send size={16} />
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
