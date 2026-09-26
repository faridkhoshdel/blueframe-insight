"use client";

import { Slider, Button, Input } from "antd";
import { ReloadOutlined, CheckOutlined } from "@ant-design/icons";
import { CHART_TYPES, useColorTheme } from "@/lib/ColorThemeContext";

const LABELS = ["رنگ ۱", "رنگ ۲", "رنگ ۳", "رنگ ۴", "رنگ ۵", "رنگ ۶"];

export default function ChartCustomizer() {
  const { settings, setChartColor, setChartOpacity, setChartType, resetChart } = useColorTheme();

  return (
    <div className="space-y-4">
      {/* مدل چارت */}
      <div>
        <p className="font-medium text-sm mb-2" style={{ color: "var(--text-primary)" }}>مدل چارت</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {CHART_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setChartType(t.id)}
              className="p-2 rounded-xl border-2 text-center transition-all"
              style={{
                borderColor: settings.chartType === t.id ? "var(--accent-color)" : "var(--border-color)",
                background: settings.chartType === t.id ? "var(--bg-hover)" : "var(--bg-secondary)",
              }}
            >
              <div className="text-lg">{t.icon}</div>
              <div className="text-[10px] font-medium" style={{ color: "var(--text-primary)" }}>{t.nameFa}</div>
            </button>
          ))}
        </div>
      </div>

      {/* رنگ‌های چارت */}
      <div>
        <p className="font-medium text-sm mb-2" style={{ color: "var(--text-primary)" }}>رنگ‌های چارت (کد Hex)</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {settings.chart.map((hex, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: "var(--bg-hover)" }}>
              <input
                type="color"
                value={hex}
                onChange={(e) => setChartColor(i, e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0"
                style={{ background: "transparent" }}
              />
              <Input
                value={hex}
                onChange={(e) => {
                  const v = e.target.value.trim().toLowerCase();
                  if (/^#[0-9a-f]{6}$/.test(v)) setChartColor(i, v);
                }}
                className="theme-input font-mono"
                style={{ fontSize: 11 }}
                maxLength={7}
                dir="ltr"
              />
            </div>
          ))}
        </div>
      </div>

      {/* شفافیت چارت */}
      <div className="flex items-center gap-3">
        <span className="text-sm shrink-0" style={{ color: "var(--text-primary)" }}>شفافیت چارت‌ها</span>
        <Slider min={10} max={100} value={settings.chartOpacity} onChange={setChartOpacity} className="flex-1" />
        <span className="text-xs w-10 tabular-nums" style={{ color: "var(--text-secondary)" }}>{settings.chartOpacity}٪</span>
      </div>

      <Button className="theme-btn-secondary" icon={<ReloadOutlined />} onClick={resetChart}>
        بازنشانی چارت‌ها
      </Button>
    </div>
  );
}
