#!/bin/bash
set -e

echo "🔍 Environment check:"
echo "  DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo "YES" || echo "NO")"

# Fallback - External URL
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  Using fallback External URL"
  export DATABASE_URL="postgresql://blueframe_user:1wQDhnQBwl5APore3b4GQL0QvhwicJ1l@dpg-daeuqnid0e5s73a3i7cg-a.frankfurt-postgres.render.com/blueframe?sslmode=require&connect_timeout=30&pool_timeout=30&connection_limit=5"
fi

echo "✅ DATABASE_URL prefix: ${DATABASE_URL:0:50}..."

# Regenerate Prisma
echo "📦 Regenerating Prisma Client..."
npx prisma generate

# Push schema
echo "📦 Pushing schema..."
npx prisma db push --skip-generate --accept-data-loss 2>&1 | tail -3 || true

echo "🚀 Starting server..."
exec node dist/main
