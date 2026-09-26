"use client";

import { useState } from "react";
import { Select, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import PhotoshopPicker from "@/components/PhotoshopPicker";
import { useColorTheme, COLOR_KEYS, ColorKey } from "@/lib/ColorThemeContext";
import { DEFAULT_COMPONENT_HEX, DEFAULT_CHART_HEX } from "@/lib/colorUtils";

export default function ColorCustomizer() {
  const { settings, setComponent, setChartColor, setChartOpacity } = useColorTheme();
  const [target, setTarget] = useState<string>("accent");

  const options = [
    {
      label: "اجزای رابط کاربری",
      options: COLOR_KEYS.map((k) => ({ value: k.key, label: `${k.nameFa} — ${k.desc}` })),
    },
    {
      label: "رنگ‌های چارت",
      options: Array.from({ length: 6 }, (_, i) => ({ value: `chart${i}`, label: `رنگ چارت ${i + 1}` })),
    },
  ];

  const isChart = target.startsWith("chart");
  const idx = isChart ? parseInt(target.slice(5), 10) : -1;

  const cur = isChart
    ? { hex: settings.chart[idx] || DEFAULT_CHART_HEX[idx], opacity: settings.chartOpacity }
    : settings.components[target as ColorKey] ?? { hex: DEFAULT_COMPONENT_HEX[target] || "#0ea5e9", opacity: 100 };

  const handleChange = (hex: string, opacity: number) => {
    if (isChart) {
      setChartColor(idx, hex);
      setChartOpacity(opacity);
    } else {
      setComponent(target as ColorKey, { hex, opacity });
    }
  };

  const resetTarget = () => {
    if (isChart) {
      setChartColor(idx, DEFAULT_CHART_HEX[idx]);
      setChartOpacity(100);
    } else {
      setComponent(target as ColorKey, null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          size="large"
          value={target}
          onChange={setTarget}
          options={options}
          className="theme-select flex-1"
          style={{ minWidth: 220 }}
        />
        <Button className="theme-btn-secondary" icon={<ReloadOutlined />} onClick={resetTarget}>
          بازنشانی این جزء
        </Button>
      </div>

      <PhotoshopPicker hex={cur.hex} opacity={cur.opacity} onChange={handleChange} />

      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
        💡 از فیلد کشویی یک جزء را انتخاب کنید، سپس با مربع رنگ، نوار رنگین‌کمان (Hue)، نوار شفافیت یا کد Hex آن را تغییر دهید. تغییرات فوراً در کل برنامه اعمال می‌شود.
      </p>
    </div>
  );
}
