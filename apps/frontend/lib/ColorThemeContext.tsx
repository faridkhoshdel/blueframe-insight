"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface ColorPalette {
  id: string;
  nameFa: string;
  emoji: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  gradientFrom: string;
  gradientTo: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
  { id: "ocean",   nameFa: "اقیانوسی",   emoji: "🌊", primary: "#0ea5e9", primaryLight: "#38bdf8", primaryDark: "#0284c7", gradientFrom: "#0ea5e9", gradientTo: "#38bdf8" },
  { id: "emerald", nameFa: "زمردی",      emoji: "💚", primary: "#10b981", primaryLight: "#34d399", primaryDark: "#059669", gradientFrom: "#10b981", gradientTo: "#34d399" },
  { id: "ruby",    nameFa: "یاقوتی",     emoji: "❤️", primary: "#e11d48", primaryLight: "#f43f5e", primaryDark: "#be123c", gradientFrom: "#e11d48", gradientTo: "#f43f5e" },
  { id: "violet",  nameFa: "بنفش",       emoji: "💜", primary: "#8b5cf6", primaryLight: "#a78bfa", primaryDark: "#7c3aed", gradientFrom: "#8b5cf6", gradientTo: "#a78bfa" },
  { id: "amber",   nameFa: "کهربایی",    emoji: "🧡", primary: "#f59e0b", primaryLight: "#fbbf24", primaryDark: "#d97706", gradientFrom: "#f59e0b", gradientTo: "#fbbf24" },
  { id: "teal",    nameFa: "فیروزه‌ای",  emoji: "💎", primary: "#14b8a6", primaryLight: "#2dd4bf", primaryDark: "#0d9488", gradientFrom: "#14b8a6", gradientTo: "#2dd4bf" },
  { id: "rose",    nameFa: "گلبهی",      emoji: "🌸", primary: "#f43f5e", primaryLight: "#fb7185", primaryDark: "#e11d48", gradientFrom: "#f43f5e", gradientTo: "#fb7185" },
  { id: "indigo",  nameFa: "نیلی",       emoji: "💙", primary: "#6366f1", primaryLight: "#818cf8", primaryDark: "#4f46e5", gradientFrom: "#6366f1", gradientTo: "#818cf8" },
];

interface ColorThemeContextType {
  palette: ColorPalette;
  setPalette: (p: ColorPalette) => void;
  setCustomColor: (hex: string) => void;
  reset: () => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

function hexToRgba(hex: string, alpha: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(num >> 16) & 0xff}, ${(num >> 8) & 0xff}, ${num & 0xff}, ${alpha})`;
}

export function applyPalette(p: ColorPalette) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--accent-color", p.primary);
  root.style.setProperty("--btn-primary-bg", `linear-gradient(135deg, ${p.gradientFrom} 0%, ${p.gradientTo} 100%)`);
  root.style.setProperty("--btn-primary-shadow", `0 4px 15px ${hexToRgba(p.primary, 0.4)}`);
  root.style.setProperty("--table-header-bg", hexToRgba(p.primary, 0.12));
}

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const [palette, setPaletteState] = useState<ColorPalette>(COLOR_PALETTES[0]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("blueframe_palette");
      if (saved) {
        const p = JSON.parse(saved);
        setPaletteState(p);
        applyPalette(p);
      }
    } catch {}
  }, []);

  const setPalette = (p: ColorPalette) => {
    setPaletteState(p);
    localStorage.setItem("blueframe_palette", JSON.stringify(p));
    applyPalette(p);
  };

  const setCustomColor = (hex: string) => {
    setPalette({
      id: "custom",
      nameFa: "سفارشی",
      emoji: "🎨",
      primary: hex,
      primaryLight: lighten(hex, 40),
      primaryDark: darken(hex, 40),
      gradientFrom: hex,
      gradientTo: lighten(hex, 30),
    });
  };

  const reset = () => setPalette(COLOR_PALETTES[0]);

  return (
    <ColorThemeContext.Provider value={{ palette, setPalette, setCustomColor, reset }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (!context) {
    return { palette: COLOR_PALETTES[0], setPalette: () => {}, setCustomColor: () => {}, reset: () => {} };
  }
  return context;
}
