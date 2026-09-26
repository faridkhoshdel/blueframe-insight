"use client";

import { Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { CHART_TYPES, useColorTheme } from "@/lib/ColorThemeContext";

export default function ChartCustomizer() {
  const { settings, setChartType, resetChart } = useColorTheme();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {CHART_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setChartType(t.id)}
            className="p-3 rounded-xl border-2 text-center transition-all"
            style={{
              borderColor: settings.chartType === t.id ? "var(--accent-color)" : "var(--border-color)",
              background: settings.chartType === t.id ? "var(--bg-hover)" : "var(--bg-secondary)",
            }}
          >
            <div className="text-xl">{t.icon}</div>
            <div className="text-[11px] font-medium mt-1" style={{ color: "var(--text-primary)" }}>{t.nameFa}</div>
          </button>
        ))}
      </div>
      <Button className="theme-btn-secondary" icon={<ReloadOutlined />} onClick={resetChart}>
        بازنشانی مدل چارت
      </Button>
      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
        💡 رنگ چارت‌ها از بخش «رنگ و شفافیت اجزا» → فیلد کشویی → «رنگ چارت ۱ تا ۶» تنظیم می‌شود.
      </p>
    </div>
  );
}
