/* ═══════════════════════════════════════════════════════════
   Mock Data — Realistic supply chain demo dataset
   Asia → US/EU distribution network
   ═══════════════════════════════════════════════════════════ */

// ── Nodes ──────────────────────────────────────────────────
export const nodes = [
  { id: "s1", name: "Shenzhen Factory", type: "supplier", country: "CN", lat: 22.54, lng: 114.06, capacity: 15000 },
  { id: "s2", name: "Shanghai Port", type: "supplier", country: "CN", lat: 31.23, lng: 121.47, capacity: 20000 },
  { id: "s3", name: "Ho Chi Minh Plant", type: "supplier", country: "VN", lat: 10.82, lng: 106.63, capacity: 8000 },
  { id: "s4", name: "Mumbai Factory", type: "supplier", country: "IN", lat: 19.08, lng: 72.88, capacity: 10000 },
  { id: "p1", name: "Los Angeles Hub", type: "plant", country: "US", lat: 33.94, lng: -118.41, capacity: 25000 },
  { id: "p2", name: "Rotterdam Hub", type: "plant", country: "NL", lat: 51.92, lng: 4.48, capacity: 18000 },
  { id: "w1", name: "Dallas Warehouse", type: "warehouse", country: "US", lat: 32.78, lng: -96.80, capacity: 30000 },
  { id: "w2", name: "Chicago Warehouse", type: "warehouse", country: "US", lat: 41.88, lng: -87.63, capacity: 22000 },
  { id: "w3", name: "Frankfurt Warehouse", type: "warehouse", country: "DE", lat: 50.11, lng: 8.68, capacity: 20000 },
  { id: "c1", name: "New York Market", type: "customer", country: "US", lat: 40.71, lng: -74.01, capacity: null },
  { id: "c2", name: "London Market", type: "customer", country: "UK", lat: 51.51, lng: -0.13, capacity: null },
  { id: "c3", name: "San Francisco Market", type: "customer", country: "US", lat: 37.77, lng: -122.42, capacity: null },
];

// ── Lanes ──────────────────────────────────────────────────
export const lanes = [
  { id: "l1", from: "s1", to: "p1", mode: "ocean", transitDays: 18, costPerUnit: 4.20, volume: 8500 },
  { id: "l2", from: "s2", to: "p1", mode: "ocean", transitDays: 15, costPerUnit: 3.80, volume: 12000 },
  { id: "l3", from: "s2", to: "p2", mode: "ocean", transitDays: 28, costPerUnit: 3.50, volume: 9000 },
  { id: "l4", from: "s3", to: "p1", mode: "ocean", transitDays: 20, costPerUnit: 4.50, volume: 5000 },
  { id: "l5", from: "s4", to: "p2", mode: "ocean", transitDays: 22, costPerUnit: 3.90, volume: 6000 },
  { id: "l6", from: "p1", to: "w1", mode: "truck", transitDays: 2, costPerUnit: 1.20, volume: 14000 },
  { id: "l7", from: "p1", to: "w2", mode: "rail", transitDays: 4, costPerUnit: 0.90, volume: 11500 },
  { id: "l8", from: "p2", to: "w3", mode: "truck", transitDays: 1, costPerUnit: 0.80, volume: 15000 },
  { id: "l9", from: "w1", to: "c3", mode: "truck", transitDays: 3, costPerUnit: 1.50, volume: 7000 },
  { id: "l10", from: "w2", to: "c1", mode: "truck", transitDays: 2, costPerUnit: 1.10, volume: 9500 },
  { id: "l11", from: "w3", to: "c2", mode: "truck", transitDays: 1, costPerUnit: 0.95, volume: 8000 },
  { id: "l12", from: "s1", to: "p2", mode: "ocean", transitDays: 30, costPerUnit: 3.60, volume: 4000 },
  { id: "l13", from: "w1", to: "c1", mode: "truck", transitDays: 3, costPerUnit: 1.40, volume: 5000 },
  { id: "l14", from: "s3", to: "p2", mode: "ocean", transitDays: 25, costPerUnit: 4.10, volume: 3500 },
];

// ── KPI Summary ──────────────────────────────────────────
export const currentKPIs = {
  totalLandedCost: 2847500,
  otifPercentage: 94.2,
  avgLeadTimeDays: 8.7,
  inventoryTurns: 11.3,
  activeSuppliers: 4,
  activeLanes: 14,
  totalSKUs: 48,
  networkNodes: 12,
};

// ── KPI Trends (12 months) ────────────────────────────────
export const kpiTrends = [
  { month: "Apr", cost: 2620000, otif: 91.5, leadTime: 10.2, turns: 9.8 },
  { month: "May", cost: 2580000, otif: 92.1, leadTime: 9.8, turns: 10.1 },
  { month: "Jun", cost: 2710000, otif: 91.8, leadTime: 9.5, turns: 10.3 },
  { month: "Jul", cost: 2690000, otif: 93.0, leadTime: 9.3, turns: 10.5 },
  { month: "Aug", cost: 2780000, otif: 92.4, leadTime: 9.1, turns: 10.8 },
  { month: "Sep", cost: 2750000, otif: 93.5, leadTime: 9.0, turns: 10.9 },
  { month: "Oct", cost: 2820000, otif: 93.2, leadTime: 8.9, turns: 11.0 },
  { month: "Nov", cost: 2800000, otif: 93.8, leadTime: 8.8, turns: 11.1 },
  { month: "Dec", cost: 2910000, otif: 93.1, leadTime: 9.2, turns: 10.7 },
  { month: "Jan", cost: 2870000, otif: 94.0, leadTime: 8.9, turns: 11.1 },
  { month: "Feb", cost: 2830000, otif: 94.5, leadTime: 8.5, turns: 11.2 },
  { month: "Mar", cost: 2847500, otif: 94.2, leadTime: 8.7, turns: 11.3 },
];

// ── Cost Breakdown ────────────────────────────────────────
export const costBreakdown = [
  { category: "Ocean Freight", value: 1180000, color: "#0176D3" },
  { category: "Inland Transport", value: 620000, color: "#2E844A" },
  { category: "Customs & Duties", value: 340000, color: "#9050E9" },
  { category: "Warehousing", value: 420000, color: "#DD7A01" },
  { category: "Packaging", value: 187500, color: "#C23934" },
  { category: "Insurance", value: 100000, color: "#747474" },
];

// ── Service Level by Node ────────────────────────────────
export const serviceLevels = [
  { node: "New York", otif: 95.1, orders: 1240 },
  { node: "London", otif: 93.8, orders: 980 },
  { node: "San Francisco", otif: 93.2, orders: 870 },
  { node: "Dallas WH", otif: 96.5, orders: 2100 },
  { node: "Chicago WH", otif: 94.8, orders: 1800 },
  { node: "Frankfurt WH", otif: 92.1, orders: 1500 },
];

// ── Lead Time Distribution ────────────────────────────────
export const leadTimeDistribution = [
  { range: "1-3d", count: 28, pct: 22 },
  { range: "4-7d", count: 35, pct: 27 },
  { range: "8-14d", count: 31, pct: 24 },
  { range: "15-21d", count: 22, pct: 17 },
  { range: "22-30d", count: 13, pct: 10 },
];

// ── Scenarios ─────────────────────────────────────────────
export const demoScenarios = [
  {
    id: "sc1",
    name: "Baseline Q1 2025",
    type: "baseline",
    status: "active",
    createdAt: "2025-01-15",
    kpis: { cost: 2847500, otif: 94.2, leadTime: 8.7, turns: 11.3 },
  },
  {
    id: "sc2",
    name: "Vietnam Expansion",
    type: "cost_down",
    status: "draft",
    createdAt: "2025-02-20",
    kpis: { cost: 2680000, otif: 93.8, leadTime: 9.1, turns: 10.9 },
  },
  {
    id: "sc3",
    name: "Dual-Source India",
    type: "resilience_up",
    status: "draft",
    createdAt: "2025-03-01",
    kpis: { cost: 2920000, otif: 96.1, leadTime: 8.2, turns: 11.5 },
  },
];

// ── Network layout positions for SVG ──────────────────────
// Columns: suppliers(x=80) → plants(x=300) → warehouses(x=520) → customers(x=740)
export const nodePositions = {
  s1: { x: 80, y: 80 },
  s2: { x: 80, y: 180 },
  s3: { x: 80, y: 280 },
  s4: { x: 80, y: 380 },
  p1: { x: 300, y: 140 },
  p2: { x: 300, y: 320 },
  w1: { x: 520, y: 100 },
  w2: { x: 520, y: 230 },
  w3: { x: 520, y: 360 },
  c1: { x: 740, y: 100 },
  c2: { x: 740, y: 280 },
  c3: { x: 740, y: 180 },
};

export const nodeTypeColors = {
  supplier: "#f59e0b",
  plant: "#3b82f6",
  warehouse: "#a855f7",
  customer: "#00d4aa",
};

export const modeColors = {
  ocean: "#3b82f6",
  truck: "#00d4aa",
  rail: "#a855f7",
  air: "#f43f5e",
};
