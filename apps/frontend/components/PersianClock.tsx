"use client";

import { useState, useEffect } from "react";

interface PersianClockProps {
  compact?: boolean;
}

// ماه‌های شمسی
const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

const PERSIAN_WEEKDAYS = [
  "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"
];

// تبدیل اعداد انگلیسی به فارسی
const toPersianDigits = (str: string | number): string => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(str).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
};

// گرفتن تاریخ شمسی با native Intl (همیشه دقیق)
const getPersianDate = (date: Date) => {
  try {
    const formatter = new Intl.DateTimeFormat("fa-IR-u-nu-latn", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
    const parts = formatter.formatToParts(date);
    
    const year = parts.find(p => p.type === "year")?.value || "";
    const month = parts.find(p => p.type === "month")?.value || "";
    const day = parts.find(p => p.type === "day")?.value || "";
    const weekday = parts.find(p => p.type === "weekday")?.value || "";
    
    return {
      year: toPersianDigits(year),
      month,
      day: toPersianDigits(day),
      weekday,
      full: `${weekday} ${toPersianDigits(day)} ${month} ${toPersianDigits(year)}`,
    };
  } catch (e) {
    return { year: "", month: "", day: "", weekday: "", full: "" };
  }
};

const getTime = (date: Date) => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return toPersianDigits(`${h}:${m}:${s}`);
};

export default function PersianClock({ compact = false }: PersianClockProps) {
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return <div className="text-xs text-[var(--text-secondary)]">--:--:--</div>;
  }

  const persian = getPersianDate(now);
  const time = getTime(now);

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs" dir="rtl">
        <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>
          {time}
        </span>
        <span className="text-[var(--text-secondary)] hidden sm:inline">
          {persian.day} {persian.month}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 py-2" dir="rtl">
      <div className="font-mono text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
        {time}
      </div>
      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
        {persian.full}
      </div>
    </div>
  );
}
