"use client";

import { Slider, Button, Input } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { COLOR_KEYS, ColorKey, useColorTheme } from "@/lib/ColorThemeContext";

function HexInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Input
      value={value}
      placeholder="#0ea5e9"
      onChange={(e) => {
        const v = e.target.value.trim().toLowerCase();
        if (/^#[0-9a-f]{6}$/.test(v)) onChange(v);
      }}
      className="theme-input font-mono"
      style={{ width: 92, fontSize: 11 }}
      maxLength={7}
      dir="ltr"
    />
  );
}

export default function ColorCustomizer() {
  const { settings, setComponent } = useColorTheme();

  return (
    <div className="space-y-3">
      {COLOR_KEYS.map(({ key, nameFa, desc }) => {
        const cur = settings.components[key as ColorKey];
        return (
          <div key={key} className="p-3 rounded-xl flex flex-col md:flex-row md:items-center gap-3" style={{ background: "var(--bg-hover)" }}>
            <div className="md:w-44 shrink-0">
              <div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{nameFa}</div>
              <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{desc}</div>
            </div>
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              <input
                type="color"
                value={cur?.hex ?? "#0ea5e9"}
                onChange={(e) => setComponent(key, { hex: e.target.value, opacity: cur?.opacity ?? 100 })}
                className="w-10 h-9 rounded-lg cursor-pointer border-0"
                style={{ background: "transparent" }}
              />
              <HexInput value={cur?.hex ?? ""} onChange={(hex) => setComponent(key, { hex, opacity: cur?.opacity ?? 100 })} />
              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                <Slider
                  min={0} max={100}
                  value={cur?.opacity ?? 100}
                  onChange={(o) => setComponent(key, { hex: cur?.hex ?? "#0ea5e9", opacity: o })}
                  className="flex-1"
                />
                <span className="text-xs w-10 tabular-nums text-left" style={{ color: "var(--text-secondary)" }}>
                  {cur?.opacity ?? 100}٪
                </span>
              </div>
              {cur && (
                <Button size="small" className="theme-btn-secondary" icon={<ReloadOutlined />} onClick={() => setComponent(key, null)} title="بازنشانی" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
