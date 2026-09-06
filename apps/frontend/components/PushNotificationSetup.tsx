"use client";
import { usePWA } from "@/lib/pwa";
import { useState } from "react";

export default function PushNotificationSetup() {
  const { isSupported, notificationPermission, registerServiceWorker, requestNotificationPermission, showNotification } = usePWA();
  const [status, setStatus] = useState('');

  const enableNotifications = async () => {
    setStatus('در حال فعال‌سازی...');
    
    const swOk = await registerServiceWorker();
    if (!swOk) {
      setStatus('❌ خطا در ثبت Service Worker');
      return;
    }
    
    const granted = await requestNotificationPermission();
    if (granted) {
      setStatus('✅ نوتیفیکیشن فعال شد');
      await showNotification('blueFrame Insight', '🎉 نوتیفیکیشن با موفقیت فعال شد!');
    } else {
      setStatus('❌ دسترسی رد شد');
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p className="text-xs text-yellow-800 dark:text-yellow-300">⚠️ مرورگر از نوتیفیکیشن پشتیبانی نمی‌کند</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-l from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
            <span>🔔</span>
            <span>نوتیفیکیشن Agent ها</span>
          </p>
          <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
            {notificationPermission === 'granted' 
              ? '✅ فعال است - هشدارهای Agent ها را دریافت می‌کنید'
              : notificationPermission === 'denied'
              ? '❌ دسترسی رد شده - از تنظیمات مرورگر فعال کنید'
              : 'برای دریافت هشدارهای فوری کلیک کنید'}
          </p>
          {status && <p className="text-xs mt-2 font-bold text-blue-700 dark:text-blue-300">{status}</p>}
        </div>
        {notificationPermission === 'default' && (
          <button
            onClick={enableNotifications}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold whitespace-nowrap hover:bg-purple-700"
          >
            فعال‌سازی
          </button>
        )}
      </div>
    </div>
  );
}
