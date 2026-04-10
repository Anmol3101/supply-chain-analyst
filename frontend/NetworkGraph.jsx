import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import GlassCard from "./components/GlassCard";
import { nodes, lanes, nodePositions, modeColors } from "./data/mockData";

const SVG_W = 840;
const SVG_H = 460;
const NODE_R = 22;

// Salesforce-style node colors
const sfNodeColors = {
  supplier: "#DD7A01",
  plant: "#0176D3",
  warehouse: "#9050E9",
  customer: "#2E844A",
};

const sfModeColors = {
  ocean: "#0176D3",
  truck: "#2E844A",
  rail: "#9050E9",
  air: "#C23934",
};

const typeLabels = { supplier: "Suppliers", plant: "Plants", warehouse: "Warehouses", customer: "Customers" };

export default function NetworkGraph() {
  const [selected, setSelected] = useState(null);
  const [hoveredLane, setHoveredLane] = useState(null);

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selected), [selected]);

  const connectedLanes = useMemo(() => {
    if (!selected) return lanes;
    return lanes.filter((l) => l.from === selected || l.to === selected);
  }, [selected]);

  const handleNodeClick = useCallback((id) => {
    setSelected((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Network Map</h1>
        <p>Supply chain topology — suppliers → plants → warehouses → customers</p>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mb-4" style={{ flexWrap: "wrap" }}>
        {Object.entries(typeLabels).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: sfNodeColors[type] }} />
            <span style={{ fontSize: 12, color: "#706E6B" }}>{label}</span>
          </div>
        ))}
        <div style={{ borderLeft: "1px solid #E5E5E5", paddingLeft: 16, marginLeft: 8 }} className="flex gap-4">
          {Object.entries(sfModeColors).map(([mode, color]) => (
            <div key={mode} className="flex items-center gap-2">
              <div style={{ width: 18, height: 3, borderRadius: 2, background: color }} />
              <span style={{ fontSize: 12, color: "#706E6B", textTransform: "capitalize" }}>{mode}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4" style={{ alignItems: "flex-start" }}>
        {/* SVG Network */}
        <GlassCard className="network-container" style={{ flex: 1, padding: 0 }}>
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="network-svg"
            style={{ display: "block" }}
          >
            {/* Background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F3F3F3" strokeWidth="1" />
              </pattern>
              <style>{`
                @keyframes flowDash {
                  to { stroke-dashoffset: -20; }
                }
              `}</style>
            </defs>
            <rect width={SVG_W} height={SVG_H} fill="#FAFAFB" />
            <rect width={SVG_W} height={SVG_H} fill="url(#grid)" />

            {/* Column labels */}
            {[
              { x: 80, label: "SUPPLIERS" },
              { x: 300, label: "PLANTS" },
              { x: 520, label: "WAREHOUSES" },
              { x: 740, label: "CUSTOMERS" },
            ].map((col) => (
              <text
                key={col.label}
                x={col.x}
                y={30}
                textAnchor="middle"
                fill="#969492"
                fontSize="10"
                fontWeight="700"
                letterSpacing="1.5"
                fontFamily="Inter, sans-serif"
              >
                {col.label}
              </text>
            ))}

            {/* Lanes */}
            {lanes.map((lane) => {
              const from = nodePositions[lane.from];
              const to = nodePositions[lane.to];
              if (!from || !to) return null;
              const isHighlighted = connectedLanes.includes(lane);
              const isHovered = hoveredLane === lane.id;
              const opacity = selected ? (isHighlighted ? 0.7 : 0.08) : 0.3;
              const width = Math.max(1.5, Math.min(5, lane.volume / 3000));

              return (
                <g key={lane.id}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={sfModeColors[lane.mode]}
                    strokeWidth={isHovered ? width + 2 : width}
                    opacity={isHovered ? 0.9 : opacity}
                    className="lane-line"
                    onMouseEnter={() => setHoveredLane(lane.id)}
                    onMouseLeave={() => setHoveredLane(null)}
                    style={{
                      cursor: "pointer",
                      ...(isHighlighted && selected
                        ? {
                            strokeDasharray: "6 4",
                            animation: "flowDash 0.8s linear infinite",
                          }
                        : {}),
                    }}
                  />
                  {isHovered && (
                    <g>
                      <rect
                        x={(from.x + to.x) / 2 - 90}
                        y={(from.y + to.y) / 2 - 22}
                        width="180"
                        height="20"
                        rx="4"
                        fill="#fff"
                        stroke="#E5E5E5"
                        strokeWidth="1"
                      />
                      <text
                        x={(from.x + to.x) / 2}
                        y={(from.y + to.y) / 2 - 8}
                        textAnchor="middle"
                        fill="#181818"
                        fontSize="10"
                        fontWeight="500"
                        fontFamily="Inter, sans-serif"
                      >
                        {lane.volume.toLocaleString()} units · {lane.transitDays}d · ${lane.costPerUnit}/u
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              const isSelected = selected === node.id;
              const dimmed = selected && !isSelected && !connectedLanes.some((l) => l.from === node.id || l.to === node.id);
              const color = sfNodeColors[node.type];

              return (
                <g
                  key={node.id}
                  className="network-node"
                  onClick={() => handleNodeClick(node.id)}
                  opacity={dimmed ? 0.15 : 1}
                >
                  {isSelected && (
                    <circle cx={pos.x} cy={pos.y} r={NODE_R + 5} fill="none" stroke={color} strokeWidth="2" opacity="0.3" />
                  )}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={NODE_R}
                    fill={color}
                    opacity={0.9}
                  />
                  <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="Inter, sans-serif">
                    {node.type[0].toUpperCase()}
                  </text>
                  <text x={pos.x} y={pos.y + NODE_R + 14} textAnchor="middle" className="node-label">
                    {node.name.split(" ").slice(0, 2).join(" ")}
                  </text>
                </g>
              );
            })}
          </svg>
        </GlassCard>

        {/* Detail Panel */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ width: 260, flexShrink: 0 }}
          >
            <GlassCard style={{ padding: 20 }} accent>
              <div className="flex items-center gap-3 mb-4">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: sfNodeColors[selectedNode.type],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {selectedNode.type[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#181818" }}>{selectedNode.name}</h3>
                  <span className="badge" style={{ textTransform: "capitalize", background: `${sfNodeColors[selectedNode.type]}18`, color: sfNodeColors[selectedNode.type] }}>
                    {selectedNode.type}
                  </span>
                </div>
              </div>

              <div className="flex-col gap-3" style={{ display: "flex" }}>
                <div>
                  <span style={{ fontSize: 11, color: "#969492", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>Country</span>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#181818" }}>{selectedNode.country}</p>
                </div>
                {selectedNode.capacity && (
                  <div>
                    <span style={{ fontSize: 11, color: "#969492", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>Capacity</span>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#181818" }}>{selectedNode.capacity.toLocaleString()} units/week</p>
                  </div>
                )}
                <div>
                  <span style={{ fontSize: 11, color: "#969492", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>Connected Lanes</span>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#181818" }}>{connectedLanes.length}</p>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: "#969492", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>Total Volume</span>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#181818" }}>
                    {connectedLanes.reduce((sum, l) => sum + l.volume, 0).toLocaleString()} units
                  </p>
                </div>
              </div>

              <button className="btn btn-secondary btn-sm w-full mt-6" onClick={() => setSelected(null)}>
                Clear Selection
              </button>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
