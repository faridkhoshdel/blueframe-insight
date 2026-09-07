#!/bin/bash
set -e
echo "🔍 DB URL prefix: ${DATABASE_URL:0:15}"
npx prisma db push --skip-generate --accept-data-loss || echo "⚠️ db push failed"
exec node dist/main
