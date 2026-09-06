"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { usePWA } from "@/lib/pwa";

export default function SettingsPage() {
  const { user } = useAuth();
  const { notificationPermission, requestNotificationPermission, registerServiceWorker, showNotification } = usePWA();
  
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState("fa");
  const [currency, setCurrency] = useState("IRR");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [showInsights, setShowInsights] = useState(true);
  const [dataRetention, setDataRetention] = useState(90);
  const [fontSize, setFontSize] = useState(14);

  // Load settings on mount
  useEffect(() => {
    const saved = localStorage.getItem("blueframe_settings");
    if (saved) {
      try {
        const s = JSON.parse(saved);
        setTheme(s.theme || "light");
        setLanguage(s.language || "fa");
        setCurrency(s.currency || "IRR");
        setEmailNotifs(s.emailNotifs ?? true);
        setPushNotifs(s.pushNotifs ?? false);
        setSoundEnabled(s.soundEnabled ?? true);
        setAutoRefresh(s.autoRefresh ?? true);
        setRefreshInterval(s.refreshInterval || 30);
        setCompactMode(s.compactMode || false);
        setAnimationsEnabled(s.animationsEnabled ?? true);
        setShowInsights(s.showInsights ?? true);
        setDataRetention(s.dataRetention || 90);
        setFontSize(s.fontSize || 14);
      } catch (e) {}
    }
    
    // Apply saved theme
    const savedTheme = localStorage.getItem("blueframe_theme");
    if (savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Apply theme immediately
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("blueframe_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("blueframe_theme", "light");
    }
    document.documentElement.style.fontSize = fontSize + "px";
  }, [theme, fontSize]);

  const saveSettings = () => {
    const settings = {
      theme, language, currency, emailNotifs, pushNotifs,
      soundEnabled, autoRefresh, refreshInterval, compactMode,
      animationsEnabled, showInsights, dataRetention, fontSize
    };
    localStorage.setItem("blueframe_settings", JSON.stringify(settings));
    alert("✅ تنظیمات با موفقیت ذخیره شد");
  };

  const resetSettings = () => {
    if (confirm("آیا مطمئن هستید؟")) {
      localStorage.removeItem("blueframe_settings");
      localStorage.removeItem("blueframe_theme");
      window.location.reload();
    }
  };

  const exportSettings = () => {
    const settings = localStorage.getItem("blueframe_settings") || "{}";
    const blob = new Blob([settings], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "blueframe-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const enablePush = async () => {
    await registerServiceWorker();
    const granted = await requestNotificationPermission();
    if (granted) {
      setPushNotifs(true);
      await showNotification("blueFrame", "🎉 نوتیفیکیشن فعال شد");
    }
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-blueframe" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? "-translate-x-6" : "-translate-x-1"
      }`} />
    </button>
  );

  const Section = ({ title, icon, children }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-l from-blueframe/5 to-transparent dark:from-blueframe/20">
        <h3 className="font-bold text-sm flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <span>{icon}</span>
          <span>{title}</span>
        </h3>
      </div>
      <div className="p-4 sm:p-5 space-y-4">{children}</div>
    </div>
  );

  const SettingRow = ({ label, description, children }: any) => (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blueframe dark:text-blue-400">⚙️ تنظیمات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-xs sm:text-sm">شخصی‌سازی تجربه کاربری</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportSettings} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium">
            📤 خروجی
          </button>
          <button onClick={resetSettings} className="px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium">
            🔄 بازنشانی
          </button>
        </div>
      </div>

      {/* Profile */}
      <Section title="پروفایل کاربر" icon="👤">
        <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="w-14 h-14 rounded-full overflow-hidden shadow-md border-2 border-white dark:border-gray-600 flex-shrink-0">
            <img src="https://faridkhoshdel.ir/wp-content/uploads/2026/06/blueframe.png" alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-gray-100">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blueframe dark:text-blue-300 rounded-full">
              👑 {user?.role}
            </span>
          </div>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="ظاهر و نمایش" icon="🎨">
        <SettingRow label="حالت تاریک" description="کاهش خستگی چشم در شب">
          <Toggle checked={theme === "dark"} onChange={(v) => setTheme(v ? "dark" : "light")} />
        </SettingRow>
        
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <SettingRow label="اندازه فونت" description={`${fontSize}px`}>
            <input type="range" min="12" max="18" value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-32 accent-blueframe" />
          </SettingRow>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <SettingRow label="حالت فشرده" description="نمایش اطلاعات بیشتر">
            <Toggle checked={compactMode} onChange={setCompactMode} />
          </SettingRow>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <SettingRow label="انیمیشن‌ها" description="افکت‌های بصری">
            <Toggle checked={animationsEnabled} onChange={setAnimationsEnabled} />
          </SettingRow>
        </div>
      </Section>

      {/* Language */}
      <Section title="زبان و منطقه" icon="🌐">
        <SettingRow label="زبان رابط" description="زبان نمایش منوها">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-gray-100">
            <option value="fa">🇮🇷 فارسی (پیش‌فرض)</option>
            <option value="en">🇺🇸 English (در حال توسعه)</option>
            <option value="ar">🇸🇦 العربية (در حال توسعه)</option>
          </select>
        </SettingRow>
        <div className="pt-2">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              💡 پشتیبانی کامل از زبان‌های دیگر در نسخه بعدی اضافه خواهد شد. انتخاب شما ذخیره شده است.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <SettingRow label="واحد پول" description="نمایش مبالغ">
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-gray-100">
              <option value="IRR">🇮🇷 ریال</option>
              <option value="TOMAN">تومان</option>
              <option value="USD">$ دلار</option>
              <option value="EUR">€ یورو</option>
            </select>
          </SettingRow>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="اعلان‌ها" icon="🔔">
        <SettingRow 
          label="نوتیفیکیشن Push" 
          description={notificationPermission === "granted" ? "✅ فعال" : notificationPermission === "denied" ? "❌ رد شده" : "برای فعال‌سازی کلیک کنید"}
        >
          <Toggle 
            checked={pushNotifs && notificationPermission === "granted"} 
            onChange={(v) => v ? enablePush() : setPushNotifs(false)} 
          />
        </SettingRow>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <SettingRow label="اعلان ایمیلی" description="خلاصه روزانه فعالیت‌ها">
            <Toggle checked={emailNotifs} onChange={setEmailNotifs} />
          </SettingRow>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <SettingRow label="صدای اعلان" description="پخش صدا هنگام پیام">
            <Toggle checked={soundEnabled} onChange={setSoundEnabled} />
          </SettingRow>
        </div>
      </Section>

      {/* Data & Performance */}
      <Section title="داده و عملکرد" icon="⚡">
        <SettingRow label="به‌روزرسانی خودکار" description="بارگذاری مجدد داده‌ها">
          <Toggle checked={autoRefresh} onChange={setAutoRefresh} />
        </SettingRow>

        {autoRefresh && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <SettingRow label="فاصله به‌روزرسانی" description={`هر ${refreshInterval} ثانیه`}>
              <input type="range" min="10" max="120" step="10" value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="w-32 accent-blueframe" />
            </SettingRow>
          </div>
        )}

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <SettingRow label="نمایش Insights AI" description="تحلیل‌های هوشمند">
            <Toggle checked={showInsights} onChange={setShowInsights} />
          </SettingRow>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <SettingRow label="حفظ داده‌ها" description={`${dataRetention} روز`}>
            <input type="range" min="30" max="365" step="30" value={dataRetention}
              onChange={(e) => setDataRetention(Number(e.target.value))}
              className="w-32 accent-blueframe" />
          </SettingRow>
        </div>
      </Section>

      {/* About */}
      <Section title="درباره blueFrame" icon="ℹ️">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">نسخه</span>
            <span className="font-mono text-gray-900 dark:text-gray-100">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">تاریخ ساخت</span>
            <span className="font-mono text-gray-900 dark:text-gray-100">2026.09.06</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">طراح و توسعه‌دهنده</span>
            <a href="https://faridkhoshdel.ir" target="_blank" rel="noopener noreferrer" 
              className="text-blueframe dark:text-blue-400 hover:underline">Farid Khoshdel</a>
          </div>
        </div>
      </Section>

      {/* Save */}
      <div className="flex gap-3 sticky bottom-4 pb-4">
        <button
          onClick={saveSettings}
          className="flex-1 py-3 bg-blueframe text-white rounded-xl font-bold shadow-lg hover:bg-blueframe-dark transition"
        >
          💾 ذخیره تنظیمات
        </button>
      </div>
    </div>
  );
}
