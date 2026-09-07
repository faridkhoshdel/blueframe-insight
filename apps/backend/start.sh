#!/bin/bash
set -e

echo "🔍 Environment check in start.sh:"
echo "  DATABASE_URL exists: $([ -n "$DATABASE_URL" ] && echo "true" || echo "false")"

# اگر DATABASE_URL ست نیست، از fallback استفاده کن
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set! Using fallback..."
  export DATABASE_URL="postgresql://blueframe_user:1wQDhnQBwl5APore3b4GQL0QvhwicJ1l@dpg-daeuqnid0e5s73a3i7cg-a-postgresql.frankfurt-postgres.render.com/blueframe?sslmode=require"
  echo "✅ Fallback set. Prefix: ${DATABASE_URL:0:30}"
fi

echo "📦 Final DATABASE_URL prefix: ${DATABASE_URL:0:30}"
echo "📦 Running prisma db push..."
npx prisma db push --skip-generate --accept-data-loss || echo "⚠️ db push failed"

echo "🚀 Starting server..."
exec node dist/main
