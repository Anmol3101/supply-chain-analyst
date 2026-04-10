# Supply Chain Network Analyst - Deployment Guide

## Quick Start (5 Minutes)

### 1. Setup
```bash
# Navigate to the project directory
cd supply-chain-analyst

# Run setup script
chmod +x setup.sh
./setup.sh

# Edit .env with your credentials
# DATABASE_URL=postgresql://...
# ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Initialize Database
```bash
psql $DATABASE_URL < database/schema.sql
```

### 3. Run Locally
```bash
npm run dev
# Visit http://localhost:5173
```

### 4. Deploy to Vercel
```bash
npm install -g vercel
vercel
# Follow prompts, add environment variables
```

## Environment Variables Required

- **DATABASE_URL** - PostgreSQL connection (Supabase, Neon, or self-hosted)
- **ANTHROPIC_API_KEY** - Claude API key from console.anthropic.com

## Architecture

```
supply-chain-analyst/
├── frontend/           React components (Dashboard, Scenarios, Network Viz)
├── backend/            Vercel Functions (Data, KPI, LLM APIs)
├── database/           PostgreSQL schema (nodes, lanes, inventory, scenarios)
├── docs/               Deployment and reference guides
└── package.json        Dependencies and scripts
```

## API Routes

- `POST /api/data-ingestion` - Upload nodes, lanes, SKUs, demand
- `POST /api/kpi-calculation` - Calculate KPIs for scenario
- `POST /api/scenarios` - Create scenario (with LLM fallback option)
- `GET /api/network-data` - Fetch network for visualization

## LLM Fallback

When database is empty or you want auto-generated decisions:
1. Create scenario with `use_llm_fallback: true`
2. Claude analyzes network topology
3. Generates realistic scenario decisions
4. Estimates KPI impacts

## Deployment to Vercel

```bash
vercel --prod
```

This deploys:
- React frontend to Vercel CDN
- API functions as Vercel Functions
- Environment variables from .env

## Troubleshooting

**Database connection error:**
```bash
psql $DATABASE_URL -c "SELECT 1"  # Test connection
```

**Claude API error:**
```bash
# Verify API key is set
echo $ANTHROPIC_API_KEY
```

**Build fails:**
```bash
npm install  # Reinstall dependencies
npm run build  # Test build locally
```

See QUICK_REFERENCE.md for workflows and examples.
