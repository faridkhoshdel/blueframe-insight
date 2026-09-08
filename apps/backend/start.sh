#!/bin/bash
set -e

echo "🔍 Environment check:"
echo "  DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo "YES" || echo "NO")"

if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  Using fallback"
  export DATABASE_URL="postgresql://blueframe_user:1wQDhnQBwl5APore3b4GQL0QvhwicJ1l@dpg-daeuqnid0e5s73a3i7cg-a.frankfurt-postgres.render.com/blueframe?sslmode=prefer&connect_timeout=30&pool_timeout=60&connection_limit=1"
fi

echo "✅ DATABASE_URL set (sslmode=prefer)"

echo "📦 Regenerating Prisma Client..."
npx prisma generate

echo "📦 Pushing schema..."
npx prisma db push --skip-generate --accept-data-loss 2>&1 | tail -3 || true

echo "🚀 Starting server on port ${PORT:-10000}..."
exec node dist/main
