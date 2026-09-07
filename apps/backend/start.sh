#!/bin/bash
set -e

echo "🔍 Environment check in start.sh:"

# Fallback برای DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set! Using fallback..."
  export DATABASE_URL="postgresql://blueframe_user:1wQDhnQBwl5APore3b4GQL0QvhwicJ1l@dpg-daeuqnid0e5s73a3i7cg-a-postgresql.frankfurt-postgres.render.com/blueframe?sslmode=require"
fi

echo "✅ DATABASE_URL prefix: ${DATABASE_URL:0:30}"

# تولید Prisma Client با URL واقعی
echo "📦 Generating Prisma Client..."
npx prisma generate

# Push کردن schema به دیتابیس
echo "📦 Pushing schema to database..."
npx prisma db push --skip-generate --accept-data-loss || echo "⚠️ db push warning (may be ok)"

# شروع سرور
echo "🚀 Starting server..."
exec node dist/main
