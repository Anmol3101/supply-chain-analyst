import React from "react";
import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", accent = false, style, ...props }) {
  return (
    <motion.div
      className={`glass-card ${accent ? "glass-card-accent" : ""} ${className}`}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
