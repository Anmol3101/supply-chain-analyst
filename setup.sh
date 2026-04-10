#!/bin/bash

# Supply Chain Analyst Setup Script
# Run this to initialize the project with all dependencies

echo "📦 Installing dependencies..."
npm install

echo "📁 Creating environment file..."
cp .env.example .env
echo "✅ Created .env - add your DATABASE_URL and ANTHROPIC_API_KEY"

echo "🗄️ Database schema ready at: database/schema.sql"
echo "   Run: psql \$DATABASE_URL < database/schema.sql"

echo ""
echo "🚀 To get started:"
echo "   1. Set DATABASE_URL and ANTHROPIC_API_KEY in .env"
echo "   2. Run: npm run dev"
echo "   3. Visit: http://localhost:5173"
echo ""
echo "📖 Full docs: docs/DEPLOYMENT.md and docs/QUICK_REFERENCE.md"
