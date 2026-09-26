export interface RGBA { r: number; g: number; b: number; }

export function hexToRgb(hex: string): RGBA {
  const h = hex.replace("#", "");
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const cl = (x: number) => Math.min(255, Math.max(0, Math.round(x)));
  return "#" + ((cl(r) << 16) | (cl(g) << 8) | cl(b)).toString(16).padStart(6, "0");
}

export function hsvToRgb(h: number, s: number, v: number): RGBA {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return { r: Math.round(f(5) * 255), g: Math.round(f(3) * 255), b: Math.round(f(1) * 255) };
}

export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, max === 0 ? 0 : d / max, max];
}

export function hexToHsv(hex: string): [number, number, number] {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsv(r, g, b);
}

export function hsvToHex(h: number, s: number, v: number): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

export const DEFAULT_COMPONENT_HEX: Record<string, string> = {
  accent: "#0ea5e9",
  textPrimary: "#1f2937",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  bgPrimary: "#f9fafb",
  bgCard: "#ffffff",
  bgHover: "#f3f4f6",
};

export const DEFAULT_CHART_HEX = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
