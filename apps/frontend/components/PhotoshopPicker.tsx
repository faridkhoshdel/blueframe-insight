"use client";

import { useEffect, useRef, useState } from "react";
import { Input, InputNumber } from "antd";
import { hexToHsv, hsvToRgb, hsvToHex, rgbToHsv, rgbToHex, hexToRgb } from "@/lib/colorUtils";

interface Props {
  hex: string;
  opacity: number;
  onChange: (hex: string, opacity: number) => void;
}

export default function PhotoshopPicker({ hex, opacity, onChange }: Props) {
  const [hsv, setHsv] = useState<[number, number, number]>(() => hexToHsv(hex));
  const [hexText, setHexText] = useState(hex);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<null | "sv" | "hue" | "alpha">(null);

  useEffect(() => { setHexText(hex); }, [hex]);

  useEffect(() => {
    const cur = hsvToHex(hsv[0], hsv[1], hsv[2]);
    if (hex.toLowerCase() !== cur) setHsv(hexToHsv(hex));
  }, [hex]);

  const emit = (h: number, s: number, v: number) => onChange(hsvToHex(h, s, v), opacity);

  const handlePointer = (e: React.PointerEvent, target: "sv" | "hue" | "alpha") => {
    const ref = target === "sv" ? svRef : target === "hue" ? hueRef : alphaRef;
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
    if (target === "sv") {
      const next: [number, number, number] = [hsv[0], x, 1 - y];
      setHsv(next); emit(next[0], next[1], next[2]);
    } else if (target === "hue") {
      const next: [number, number, number] = [x * 360, hsv[1], hsv[2]];
      setHsv(next); emit(next[0], next[1], next[2]);
    } else {
      onChange(hex, Math.round(x * 100));
    }
  };

  const down = (t: "sv" | "hue" | "alpha") => (e: React.PointerEvent) => {
    dragging.current = t;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    handlePointer(e, t);
  };
  const move = (t: "sv" | "hue" | "alpha") => (e: React.PointerEvent) => {
    if (dragging.current === t) handlePointer(e, t);
  };
  const up = () => { dragging.current = null; };

  const commitHex = (txt: string) => {
    const v = txt.trim().toLowerCase();
    if (/^#[0-9a-f]{6}$/.test(v)) {
      onChange(v, opacity);
      setHsv(hexToHsv(v));
    }
  };

  const rgb = hsvToRgb(hsv[0], hsv[1], hsv[2]);
  const hueColor = hsvToHex(hsv[0], 1, 1);

  const setRgb = (key: "r" | "g" | "b", val: number) => {
    const next = { ...rgb, [key]: Math.min(255, Math.max(0, val || 0)) };
    const [h, s, v] = rgbToHsv(next.r, next.g, next.b);
    setHsv([h, s, v]);
    onChange(rgbToHex(next.r, next.g, next.b), opacity);
  };

  return (
    <div dir="ltr" className="p-4 rounded-xl" style={{ background: "var(--bg-hover)" }}>
      {/* مربع اشباع / روشنایی */}
      <div
        ref={svRef}
        onPointerDown={down("sv")} onPointerMove={move("sv")} onPointerUp={up}
        className="relative h-44 rounded-lg cursor-crosshair touch-none select-none"
        style={{ background: hueColor }}
      >
        <div className="absolute inset-0 rounded-lg" style={{ background: "linear-gradient(to right, #fff, rgba(255,255,255,0))" }} />
        <div className="absolute inset-0 rounded-lg" style={{ background: "linear-gradient(to top, #000, rgba(0,0,0,0))" }} />
        <div
          className="absolute w-4 h-4 rounded-full border-2 border-white pointer-events-none"
          style={{ left: `calc(${hsv[1] * 100}% - 8px)`, top: `calc(${(1 - hsv[2]) * 100}% - 8px)`, boxShadow: "0 0 4px rgba(0,0,0,0.6)" }}
        />
      </div>

      {/* نوار Hue */}
      <div
        ref={hueRef}
        onPointerDown={down("hue")} onPointerMove={move("hue")} onPointerUp={up}
        className="relative h-4 rounded-full mt-3 cursor-pointer touch-none select-none"
        style={{ background: "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)" }}
      >
        <div className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white pointer-events-none" style={{ left: `calc(${(hsv[0] / 360) * 100}% - 8px)`, transform: "translateY(-50%)", boxShadow: "0 0 4px rgba(0,0,0,0.6)" }} />
      </div>

      {/* نوار شفافیت */}
      <div
        ref={alphaRef}
        onPointerDown={down("alpha")} onPointerMove={move("alpha")} onPointerUp={up}
        className="relative h-4 rounded-full mt-3 cursor-pointer touch-none select-none overflow-hidden"
        style={{ backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)", backgroundSize: "8px 8px", backgroundPosition: "0 0, 4px 4px", backgroundColor: "#fff" }}
      >
        <div className="absolute inset-0" style={{ background: `linear-gradient(to right, rgba(${rgb.r},${rgb.g},${rgb.b},0), rgb(${rgb.r},${rgb.g},${rgb.b}))` }} />
        <div className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white pointer-events-none" style={{ left: `calc(${opacity}% - 8px)`, transform: "translateY(-50%)", boxShadow: "0 0 4px rgba(0,0,0,0.6)" }} />
      </div>

      {/* ورودی‌ها */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <div
          className="w-10 h-10 rounded-lg border-2"
          style={{ background: `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity / 100})`, borderColor: "var(--border-color)" }}
        />
        <Input
          value={hexText}
          onChange={(e) => setHexText(e.target.value)}
          onBlur={(e) => commitHex(e.target.value)}
          onPressEnter={(e: any) => commitHex(e.target.value)}
          className="theme-input font-mono"
          style={{ width: 100, fontSize: 12 }}
          maxLength={7}
        />
        <InputNumber size="small" min={0} max={255} value={rgb.r} onChange={(v) => setRgb("r", v as number)} className="theme-input" style={{ width: 62 }} />
        <InputNumber size="small" min={0} max={255} value={rgb.g} onChange={(v) => setRgb("g", v as number)} className="theme-input" style={{ width: 62 }} />
        <InputNumber size="small" min={0} max={255} value={rgb.b} onChange={(v) => setRgb("b", v as number)} className="theme-input" style={{ width: 62 }} />
        <InputNumber size="small" min={0} max={100} value={opacity} onChange={(v) => onChange(hex, (v as number) ?? 100)} className="theme-input" style={{ width: 70 }} addonAfter="٪" />
      </div>
    </div>
  );
}
