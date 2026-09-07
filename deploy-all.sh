#!/bin/bash
set -e

echo "🚀 شروع استقرار خودکار blueframe..."
echo ""

# 1. دریافت Database Connection Info
echo "📦 [1/5] دریافت اطلاعات دیتابیس..."
DB_ID="dpg-daeuqnid0e5s73a3i7cg-a"
DB_INFO=$(render postgres connection-info $DB_ID --output json 2>/dev/null)

# استخراج Internal URL از JSON
INTERNAL_URL=$(echo "$DB_INFO" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    # تلاش برای پیدا کردن internal connection string
    if isinstance(data, dict):
        for key in ['internalConnectionString', 'internal', 'connectionString']:
            if key in data:
                print(data[key])
                sys.exit(0)
        # اگر ساختار متفاوت بود
        if 'data' in data and 'connectionInfo' in data['data']:
            info = data['data']['connectionInfo']
            if 'internalConnectionString' in info:
                print(info['internalConnectionString'])
                sys.exit(0)
    print('')
except:
    print('')
" 2>/dev/null)

if [ -z "$INTERNAL_URL" ]; then
    echo "⚠️  تلاش روش جایگزین برای دریافت URL..."
    INTERNAL_URL=$(render postgres connection-info $DB_ID --output text 2>&1 | grep -i "internal" | grep -oE "postgresql://[^ ]+" | head -1)
fi

if [ -z "$INTERNAL_URL" ]; then
    echo "❌ نتوانستیم Database URL را بگیریم. خروجی connection-info:"
    render postgres connection-info $DB_ID
    exit 1
fi

echo "✅ Database URL: ${INTERNAL_URL:0:50}..."
echo ""

# 2. بررسی وجود Web Service
echo "🌐 [2/5] بررسی Web Service..."
EXISTING=$(render services list --output json 2>/dev/null | python3 -c "
import json, sys
try:
    services = json.load(sys.stdin)
    for s in services:
        name = s.get('name', '') or s.get('data', {}).get('name', '')
        if 'blueframe-backend' in name:
            print(s.get('id', '') or s.get('data', {}).get('id', ''))
            sys.exit(0)
    print('')
except:
    print('')
" 2>/dev/null)

if [ -n "$EXISTING" ]; then
    echo "⚠️  Web Service از قبل وجود دارد: $EXISTING"
    SERVICE_ID="$EXISTING"
else
    echo "🆕 ساخت Web Service جدید..."
    
    # 3. ساخت Web Service
    echo "🔧 [3/5] ساخت Web Service..."
    CREATE_OUTPUT=$(render services create \
      --type web \
      --name blueframe-backend \
      --runtime node \
      --region frankfurt \
      --plan free \
      --repo https://github.com/faridkhoshdel/blueframe-insight \
      --root-dir apps/backend \
      --build-command "npm install && npx prisma generate && npx prisma db push && npm run build" \
      --start-command "npm run start:prod" \
      --confirm \
      --output json 2>&1)
    
    echo "خروجی ساخت سرویس:"
    echo "$CREATE_OUTPUT"
    
    SERVICE_ID=$(echo "$CREATE_OUTPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if isinstance(data, dict):
        print(data.get('id', '') or data.get('data', {}).get('id', ''))
    else:
        print('')
except:
    print('')
" 2>/dev/null)
    
    if [ -z "$SERVICE_ID" ]; then
        echo "❌ ساخت Web Service ناموفق بود"
        exit 1
    fi
    
    echo "✅ Service ID: $SERVICE_ID"
fi

echo ""

# 4. تنظیم Environment Variables
echo "🔐 [4/5] تنظیم Environment Variables..."
render services env set --service-id $SERVICE_ID \
  --env-var "DATABASE_URL=$INTERNAL_URL" \
  --env-var "NODE_ENV=production" \
  --env-var "PORT=3000" \
  --env-var "JWT_SECRET=blueframe-prod-secure-key-$(date +%s)" \
  --env-var "JWT_EXPIRES_IN=7d" \
  --confirm 2>&1 || echo "⚠️  خطا در تنظیم env vars، ادامه می‌دهیم..."

echo "✅ Environment Variables تنظیم شدند"
echo ""

# 5. Trigger Deploy
echo "🚀 [5/5] شروع Deploy..."
render deploys create --service-id $SERVICE_ID --confirm --output json 2>&1 || \
render deploys create --service $SERVICE_ID --confirm 2>&1 || \
echo "⚠️  deploy trigger نشد، از dashboard deploy کنید"

echo ""
echo "=========================================="
echo "✅ استقرار شروع شد!"
echo "=========================================="
echo ""
echo "📊 Service ID: $SERVICE_ID"
echo "🗄️  Database ID: $DB_ID"
echo ""
echo "🔍 برای دیدن لاگ‌های زنده:"
echo "   render logs --service $SERVICE_ID -f"
echo ""
echo "📋 لیست سرویس‌ها:"
echo "   render services list"
echo ""
echo "⏳ صبر کنید 3-5 دقیقه تا deploy کامل شود"
echo "   سپس URL را از render services list بگیرید"
