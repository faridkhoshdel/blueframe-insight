"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ChartType = "line" | "area" | "bar" | "pie" | "donut" | "radar" | "scatter" | "composed";

export const CHART_TYPES: { id: ChartType; nameFa: string; icon: string }[] = [
  { id: "line", nameFa: "خطی", icon: "📈" },
  { id: "area", nameFa: "ناحیه‌ای", icon: "🌊" },
  { id: "bar", nameFa: "ستونی", icon: "📊" },
  { id: "pie", nameFa: "دایره‌ای", icon: "🥧" },
  { id: "donut", nameFa: "دوناتی", icon: "🍩" },
  { id: "radar", nameFa: "راداری", icon: "🕸️" },
  { id: "scatter", nameFa: "پراکندگی", icon: "✨" },
  { id: "composed", nameFa: "ترکیبی", icon: "🎛️" },
];

export interface ComponentColor { hex: string; opacity: number; }
export type ColorKey = "accent" | "textPrimary" | "textSecondary" | "border" | "bgPrimary" | "bgCard" | "bgHover";

export const COLOR_KEYS: { key: ColorKey; nameFa: string; desc: string }[] = [
  { key: "accent", nameFa: "رنگ تأکید", desc: "دکمه‌ها، لینک‌ها، هایلایت‌ها" },
  { key: "textPrimary", nameFa: "متن اصلی", desc: "عنوان‌ها و متن‌های اصلی" },
  { key: "textSecondary", nameFa: "متن ثانویه", desc: "توضیحات و متن کم‌رنگ" },
  { key: "border", nameFa: "حاشیه‌ها", desc: "خطوط دور کارت و جدول" },
  { key: "bgPrimary", nameFa: "پس‌زمینه اصلی", desc: "پس‌زمینه کل صفحه" },
  { key: "bgCard", nameFa: "پس‌زمینه کارت‌ها", desc: "کارت‌ها، مودال‌ها، جدول‌ها" },
  { key: "bgHover", nameFa: "پس‌زمینه هاور", desc: "هاور و سطرها" },
];

export interface ColorSettings {
  components: Partial<Record<ColorKey, ComponentColor>>;
  chart: string[];
  chartOpacity: number;
  chartType: ChartType;
}

const DEFAULT_CHART = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
const DEFAULT_SETTINGS: ColorSettings = { components: {}, chart: DEFAULT_CHART, chartOpacity: 100, chartType: "line" };

export const COLOR_PALETTES = [
  { id: "ocean", nameFa: "اقیانوسی", emoji: "🌊", hex: "#0ea5e9" },
  { id: "emerald", nameFa: "زمردی", emoji: "💚", hex: "#10b981" },
  { id: "ruby", nameFa: "یاقوتی", emoji: "❤️", hex: "#e11d48" },
  { id: "violet", nameFa: "بنفش", emoji: "💜", hex: "#8b5cf6" },
  { id: "amber", nameFa: "کهربایی", emoji: "🧡", hex: "#f59e0b" },
  { id: "teal", nameFa: "فیروزه‌ای", emoji: "💎", hex: "#14b8a6" },
  { id: "rose", nameFa: "گلبهی", emoji: "🌸", hex: "#f43f5e" },
  { id: "indigo", nameFa: "نیلی", emoji: "💙", hex: "#6366f1" },
];

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const num = parseInt(h, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 255) + amount);
  const g = Math.min(255, ((num >> 8) & 255) + amount);
  const b = Math.min(255, (num & 255) + amount);
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

export function applySettings(s: ColorSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const set = (k: string, v: string) => root.style.setProperty(k, v, "important");
  const c = s.components;
  if (c.accent) {
    set("--accent-color", hexToRgba(c.accent.hex, c.accent.opacity / 100));
    set("--btn-primary-bg", `linear-gradient(135deg, ${c.accent.hex} 0%, ${lighten(c.accent.hex, 30)} 100%)`);
    set("--btn-primary-shadow", `0 4px 15px ${hexToRgba(c.accent.hex, 0.4)}`);
    set("--table-header-bg", hexToRgba(c.accent.hex, 0.12));
  }
  if (c.textPrimary) set("--text-primary", hexToRgba(c.textPrimary.hex, c.textPrimary.opacity / 100));
  if (c.textSecondary) set("--text-secondary", hexToRgba(c.textSecondary.hex, c.textSecondary.opacity / 100));
  if (c.border) set("--border-color", hexToRgba(c.border.hex, c.border.opacity / 100));
  if (c.bgPrimary) set("--bg-primary", hexToRgba(c.bgPrimary.hex, c.bgPrimary.opacity / 100));
  if (c.bgCard) set("--bg-card", hexToRgba(c.bgCard.hex, c.bgCard.opacity / 100));
  if (c.bgHover) set("--bg-hover", hexToRgba(c.bgHover.hex, c.bgHover.opacity / 100));
  s.chart.forEach((hex, i) => set(`--chart-${i + 1}`, hexToRgba(hex, s.chartOpacity / 100)));
}

interface Ctx {
  settings: ColorSettings;
  setComponent: (key: ColorKey, value: ComponentColor | null) => void;
  setAccentPreset: (hex: string) => void;
  setChartColor: (index: number, hex: string) => void;
  setChartOpacity: (o: number) => void;
  setChartType: (t: ChartType) => void;
  resetChart: () => void;
  resetAll: () => void;
}

const ColorThemeContext = createContext<Ctx | undefined>(undefined);

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ColorSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("blueframe_color_settings");
      if (saved) {
        const s = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        setSettings(s);
        applySettings(s);
      }
    } catch {}
  }, []);

  const commit = (s: ColorSettings) => {
    setSettings(s);
    localStorage.setItem("blueframe_color_settings", JSON.stringify(s));
    applySettings(s);
  };

  const setComponent = (key: ColorKey, value: ComponentColor | null) => {
    const components = { ...settings.components };
    if (value === null) delete components[key];
    else components[key] = value;
    commit({ ...settings, components });
  };

  const setAccentPreset = (hex: string) => setComponent("accent", { hex, opacity: 100 });

  const setChartColor = (index: number, hex: string) => {
    const chart = [...settings.chart];
    chart[index] = hex;
    commit({ ...settings, chart });
  };

  const setChartOpacity = (o: number) => commit({ ...settings, chartOpacity: o });
  const setChartType = (t: ChartType) => commit({ ...settings, chartType: t });
  const resetChart = () => commit({ ...settings, chart: DEFAULT_CHART, chartOpacity: 100, chartType: "line" });
  const resetAll = () => {
    localStorage.removeItem("blueframe_color_settings");
    commit(DEFAULT_SETTINGS);
  };

  return (
    <ColorThemeContext.Provider value={{ settings, setComponent, setAccentPreset, setChartColor, setChartOpacity, setChartType, resetChart, resetAll }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme(): Ctx {
  const ctx = useContext(ColorThemeContext);
  if (!ctx) return { settings: DEFAULT_SETTINGS, setComponent: () => {}, setAccentPreset: () => {}, setChartColor: () => {}, setChartOpacity: () => {}, setChartType: () => {}, resetChart: () => {}, resetAll: () => {} };
  return ctx;
}
