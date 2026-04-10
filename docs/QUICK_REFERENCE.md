# Supply Chain Network Analyst - Quick Reference

## Overview

Full-stack supply chain optimization system with:
- React frontend (KPI dashboard, scenarios, network visualization)
- Vercel backend (API functions for data, KPIs, scenarios)
- PostgreSQL database (nodes, lanes, inventory, KPIs)
- Claude AI fallback (auto-generate scenarios when data missing)

## Quick Start

```bash
# 1. Setup
cd supply-chain-analyst
./setup.sh

# 2. Configure environment
# Edit .env with DATABASE_URL and ANTHROPIC_API_KEY

# 3. Initialize database
psql $DATABASE_URL < database/schema.sql

# 4. Run locally
npm run dev

# 5. Visit http://localhost:5173
```

## Key Workflows

### Create Cost-Down Scenario
1. Click "Create Scenario"
2. Name: "Q2 Cost Optimization"
3. Type: "Cost-Down"
4. Enable "Use Claude LLM"
5. Claude suggests lane reoptimization and supplier changes
6. Dashboard shows cost reduction estimate

### Analyze Network
1. Upload network data (nodes, lanes) via upload interface
2. View network map visualization
3. Claude identifies bottlenecks and risks
4. Create resilience scenario to add backup sources

### Compare Scenarios
Create multiple scenarios (cost-down vs service-up vs resilience-up) and view side-by-side KPI comparisons.

## API Examples

### Upload Network Data
```bash
curl -X POST http://localhost:3000/api/data-ingestion \
  -H "Content-Type: application/json" \
  -d '{
    "data_type": "nodes",
    "records": [
      {
        "name": "Shanghai Port",
        "type": "supplier",
        "country": "CN",
        "capacity_units": 10000,
        "capacity_periodicity": "per_week"
      }
    ]
  }'
```

### Create Scenario with LLM
```bash
curl -X POST http://localhost:3000/api/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cost Optimization",
    "scenario_type": "cost_down",
    "use_llm_fallback": true
  }'
```

### Calculate KPIs
```bash
curl -X POST http://localhost:3000/api/kpi-calculation \
  -H "Content-Type: application/json" \
  -d '{"scenario_id": "550e8400-e29b-41d4-a716-446655440000"}'
```

## KPIs Tracked

- **Total Landed Cost** - Production + Transport + Duties + Storage
- **OTIF %** - On-Time In-Full (service level)
- **Lead Time (days)** - Average supplier to customer
- **Inventory Turns** - Annual cost / avg inventory

## LLM Fallback System

When real data is missing, Claude:
1. Analyzes network topology
2. Generates realistic decisions
3. Estimates cost/service/resilience impacts
4. Provides implementation roadmap

## File Structure

```
supply-chain-analyst/
├── frontend/
│   ├── KPIDashboard.jsx
│   ├── ScenarioBuilder.jsx
│   └── app.jsx
├── backend/
│   ├── llm-fallback.js
│   ├── data-ingestion.js
│   ├── kpi-calculation.js
│   └── scenarios.js
├── database/
│   └── schema.sql
├── docs/
│   ├── DEPLOYMENT.md
│   └── QUICK_REFERENCE.md
├── package.json
├── setup.sh
└── .env.example
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "No database connection" | Check `export DATABASE_URL` is set |
| "Claude API timeout" | Verify `ANTHROPIC_API_KEY` and internet |
| "Files not found uploading" | Use comma-separated CSV format |
| "KPIs show 0" | Upload lanes data first, then create scenario |

## Deployment

```bash
npm run build          # Build for production
vercel --prod          # Deploy to Vercel
```

## Next Steps

1. Populate database with real network data
2. Build scenario comparison UI
3. Add multi-user permissions
4. Integrate with ERP/TMS for live KPI tracking
5. Create export reports (PDF/Excel)
