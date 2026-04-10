import React from "react";
import { motion } from "framer-motion";

export default function KPICard({ icon, label, value, trend, trendLabel, color = "teal", delay = 0 }) {
  const trendDir = trend > 0 ? "up" : trend < 0 ? "down" : "neutral";
  const trendSymbol = trend > 0 ? "↑" : trend < 0 ? "↓" : "→";

  return (
    <motion.div
      className={`glass-card kpi-card glow-${color}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className={`kpi-icon ${color}`}>{icon}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {trend !== undefined && (
        <span className={`kpi-trend ${trendDir}`}>
          {trendSymbol} {Math.abs(trend)}%{trendLabel ? ` ${trendLabel}` : ""}
        </span>
      )}
    </motion.div>
  );
}
