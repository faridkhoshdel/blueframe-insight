#!/bin/bash
echo "🚀 Starting backend on port $PORT"
echo "📊 DEMO_MODE=$DEMO_MODE"
echo "🗄️  DB configured: $([ -n "$DATABASE_URL" ] && echo YES || echo NO)"
node dist/main.js
