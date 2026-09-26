"use client";

import { useEffect, useState } from "react";
import { formatJalaliDate, formatTimeFa } from "@/lib/jalali";

export default function PersianClock({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!now) {
    return compact ? <span className="text-[11px]">--:--</span> : <div className="theme-card" style={{ padding: 20 }} />;
  }

  if (compact) {
    return (
      <div className="flex flex-col items-center leading-tight" dir="rtl">
        <span className="text-[11px] font-bold tabular-nums" style={{ color: "var(--accent-color)" }}>
          🕐 {formatTimeFa(now, false)}
        </span>
        <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
          {formatJalaliDate(now, false)}
        </span>
      </div>
    );
  }

  return (
    <div className="theme-card text-center" style={{ padding: "24px" }}>
      <div
        className="text-4xl md:text-5xl font-extrabold tabular-nums tracking-widest"
        style={{ color: "var(--accent-color)" }}
        dir="ltr"
      >
        {formatTimeFa(now)}
      </div>
      <div className="mt-3 text-sm md:text-base font-bold" style={{ color: "var(--text-primary)" }}>
        {formatJalaliDate(now)}
      </div>
      <div className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
        معادل میلادی: {now.toLocaleDateString("en-GB")}
      </div>
    </div>
  );
}
