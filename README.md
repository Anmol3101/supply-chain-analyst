# Supply Chain Network Analyst

Full-stack supply chain optimization platform with an AI-powered scenario engine, interactive network visualization, and real-time KPI analytics.

## Features

- **📊 KPI Dashboard** — Animated cards with cost trends, OTIF performance, lead time distribution, and service level tables
- **🗺️ Network Map** — Interactive SVG visualization of suppliers → plants → warehouses → customers with flow animation
- **🧪 Scenario Builder** — Create cost-down, service-up, or resilience-up scenarios with side-by-side comparison
- **📤 Data Upload** — Drag-and-drop CSV ingestion for all 6 entity types (nodes, lanes, SKUs, demand, inventory, supplier-SKUs)
- **✨ AI Insights** — Chat with Claude to get bottleneck analysis, cost opportunities, and optimization recommendations
- **🌙 Premium Dark UI** — Glassmorphic design system with Framer Motion animations

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server → http://localhost:5173
```

The app ships with built-in demo data — no database or API keys needed to explore the UI.

### Full Stack (with database + AI)

```bash
cp .env.example .env
# Edit .env → set DATABASE_URL and ANTHROPIC_API_KEY

psql $DATABASE_URL < database/schema.sql   # Initialize DB
npm run server &                           # Start API on :3001
npm run dev                                # Start UI on :5173
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Recharts, Framer Motion, Lucide Icons |
| Backend | Node.js, Express, Vercel Functions |
| Database | PostgreSQL (8 normalized tables) |
| AI | Anthropic Claude API |
| Deployment | Vercel |

## Project Structure

```
supply-chain-analyst/
├── frontend/
│   ├── App.jsx              # Root layout + routing
│   ├── main.jsx             # React entry point
│   ├── index.css            # Design system (dark glassmorphism)
│   ├── Sidebar.jsx          # Navigation sidebar
│   ├── KPIDashboard.jsx     # KPI cards + charts
│   ├── NetworkGraph.jsx     # Interactive SVG network map
│   ├── ScenarioBuilder.jsx  # Scenario creation + comparison
│   ├── DataUpload.jsx       # CSV drag-and-drop upload
│   ├── AIInsights.jsx       # Claude chat interface
│   ├── components/
│   │   ├── GlassCard.jsx    # Reusable glass container
│   │   └── KPICard.jsx      # Animated KPI metric card
│   └── data/
│       └── mockData.js      # Demo dataset (12 nodes, 14 lanes)
├── backend/
│   ├── server.js            # Express API server
│   ├── data-ingestion.js    # CSV → DB for all entity types
│   ├── kpi-calculation.js   # Real KPI computation from DB
│   └── llm-fallback.js      # Claude AI integration (DRY)
├── database/
│   └── schema.sql           # PostgreSQL DDL (8 tables + indexes)
├── docs/
│   ├── DEPLOYMENT.md        # Full setup guide
│   └── QUICK_REFERENCE.md   # API examples + workflows
├── index.html               # Vite HTML entry
├── vite.config.js            # Vite + React config
├── package.json
├── setup.sh
└── .env.example
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/data-ingestion` | Upload nodes, lanes, SKUs, demand, inventory, supplier_skus |
| POST | `/api/kpi-calculation` | Calculate KPIs for a scenario from DB data |
| POST | `/api/scenarios` | Create scenario (with optional LLM fallback) |
| POST | `/api/analyze-network` | Claude-powered network analysis |
| GET | `/api/health` | Health check (DB + LLM status) |

## Environment Variables

```
DATABASE_URL=postgresql://user:pass@host/db     # Required for DB features
ANTHROPIC_API_KEY=sk-ant-...                     # Required for AI features
```

## Documentation

- [DEPLOYMENT.md](docs/DEPLOYMENT.md) — Full setup and deployment guide
- [QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) — Workflows and API examples
- [schema.sql](database/schema.sql) — Database structure
