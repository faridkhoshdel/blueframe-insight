#!/bin/bash
set -e

echo "=========================================="
echo "🔍 start.sh Environment Check"
echo "=========================================="
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo "YES" || echo "NO")"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

# Fallback برای DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL missing! Setting fallback..."
  export DATABASE_URL="postgresql://blueframe_user:1wQDhnQBwl5APore3b4GQL0QvhwicJ1l@dpg-daeuqnid0e5s73a3i7cg-a-postgresql.frankfurt-postgres.render.com/blueframe?sslmode=require"
fi

echo "✅ DATABASE_URL prefix: ${DATABASE_URL:0:40}"
echo "=========================================="

# Regenerate Prisma با URL واقعی
echo "📦 Regenerating Prisma Client..."
npx prisma generate 2>&1 | tail -5

# Push schema
echo "📦 Pushing schema..."
npx prisma db push --skip-generate --accept-data-loss 2>&1 | tail -3 || true

echo "🚀 Starting server on port ${PORT:-10000}..."
exec node dist/main
