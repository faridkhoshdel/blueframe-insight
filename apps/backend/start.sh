#!/bin/bash
set -e

echo "🔍 Checking DATABASE_URL..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set!"
  echo "Available env vars:"
  env | grep -i "database\|postgres\|port\|node\|jwt" || echo "(none)"
  exit 1
fi

# تست URL
if [[ ! "$DATABASE_URL" =~ ^postgres(ql)?:// ]]; then
  echo "❌ ERROR: DATABASE_URL format is invalid"
  echo "Value starts with: ${DATABASE_URL:0:20}"
  exit 1
fi

echo "✅ DATABASE_URL is set and valid"

# اجرای migrations
echo "📦 Running prisma db push..."
npx prisma db push --skip-generate || {
  echo "⚠️  db push failed, trying migrate deploy..."
  npx prisma migrate deploy || true
}

# شروع سرور
echo "🚀 Starting server..."
exec npm run start:prod
