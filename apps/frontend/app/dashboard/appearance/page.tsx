"use client";

import { Typography, Button, message } from "antd";
import { ReloadOutlined, CheckOutlined, SunOutlined, MoonOutlined, CloudOutlined } from "@ant-design/icons";
import ColorCustomizer from "@/components/ColorCustomizer";
import ChartCustomizer from "@/components/ChartCustomizer";
import SmartChart from "@/components/charts/SmartChart";
import { useTheme, ThemeMode } from "@/lib/ThemeContext";
import { useColorTheme, COLOR_PALETTES } from "@/lib/ColorThemeContext";

const { Title } = Typography;

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();
  const { settings, setAccentPreset, resetAll } = useColorTheme();

  const themes: { id: ThemeMode; name: string; icon: any; desc: string }[] = [
    { id: "light", name: "روشن", icon: <SunOutlined />, desc: "پس‌زمینه سفید، متن تیره" },
    { id: "dark", name: "تاریک", icon: <MoonOutlined />, desc: "پس‌زمینه تیره، متن روشن" },
    { id: "glass", name: "شیشه‌ای", icon: <CloudOutlined />, desc: "سفید مات با افکت شیشه" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <Title level={2} className="theme-title" style={{ margin: 0 }}>🎨 ظاهر و شخصی‌سازی</Title>
          <p className="theme-subtitle text-sm mt-1">تم، رنگ همه اجزا (با کد Hex و شفافیت) و مدل چارت‌ها</p>
        </div>
        <Button className="theme-btn-secondary" icon={<ReloadOutlined />} onClick={() => { resetAll(); setTheme("light"); message.success("همه تنظیمات بازنشانی شد"); }}>
          بازنشانی کامل
        </Button>
      </div>

      {/* تم */}
      <div className="theme-card mb-6">
        <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>۱. حالت نمایش</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themes.map((t) => (
            <button key={t.id} onClick={() => setTheme(t.id)} className="p-4 rounded-xl border-2 text-right transition-all"
              style={{ borderColor: theme === t.id ? "var(--accent-color)" : "var(--border-color)", background: theme === t.id ? "var(--bg-hover)" : "var(--bg-secondary)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: "var(--accent-color)", fontSize: 18 }}>{t.icon}</span>
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>{t.name}</span>
                {theme === t.id && <CheckOutlined style={{ color: "var(--accent-color)", marginRight: "auto" }} />}
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* پالت‌های آماده */}
      <div className="theme-card mb-6">
        <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>۲. پالت‌های آماده (رنگ تأکید)</h3>
        <div className="flex flex-wrap gap-2">
          {COLOR_PALETTES.map((p) => (
            <button key={p.id} onClick={() => setAccentPreset(p.hex)}
              className="px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all"
              style={{ borderColor: settings.components.accent?.hex === p.hex ? p.hex : "var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
              <span className="inline-block w-3 h-3 rounded-full ml-1" style={{ background: p.hex }} />
              {p.emoji} {p.nameFa}
            </button>
          ))}
        </div>
      </div>

      {/* رنگ اجزا */}
      <div className="theme-card mb-6">
        <h3 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>۳. رنگ و شفافیت همه اجزا</h3>
        <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>هر جزء را با کد Hex (مثل #0ea5e9) و درصد شفافیت تنظیم کنید. دکمه 🔄 هر جزء را به حالت تم برمی‌گرداند.</p>
        <ColorCustomizer />
      </div>

      {/* چارت‌ها */}
      <div className="theme-card mb-6">
        <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>۴. چارت‌ها</h3>
        <ChartCustomizer />
      </div>

      {/* پیش‌نمایش */}
      <div className="theme-card">
        <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>۵. پیش‌نمایش زنده</h3>
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <Button className="theme-btn-primary">دکمه اصلی</Button>
          <Button className="theme-btn-secondary">دکمه ثانویه</Button>
          <span className="theme-tag theme-tag-blue">برچسب</span>
          <span className="theme-tag theme-tag-success">موفق</span>
          <span className="theme-tag theme-tag-warning">هشدار</span>
        </div>
        <SmartChart />
      </div>
    </div>
  );
}
