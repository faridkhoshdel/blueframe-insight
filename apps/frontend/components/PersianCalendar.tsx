"use client";

import { useMemo, useState } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button } from "antd";
import {
  JALALI_MONTHS, WEEKDAY_SHORT, toJalali, toGregorian,
  jalaliMonthLength, persianWeekdayIndex, faDigits,
} from "@/lib/jalali";

export default function PersianCalendar() {
  const today = new Date();
  const tj = toJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const [view, setView] = useState({ jy: tj.jy, jm: tj.jm });

  const cells = useMemo(() => {
    const len = jalaliMonthLength(view.jy, view.jm);
    const fg = toGregorian(view.jy, view.jm, 1);
    const firstDate = new Date(fg.gy, fg.gm - 1, fg.gd);
    const offset = persianWeekdayIndex(firstDate);
    const arr: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= len; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [view]);

  const changeMonth = (delta: number) => {
    setView(v => {
      let jm = v.jm + delta;
      let jy = v.jy;
      if (jm < 1) { jm = 12; jy -= 1; }
      if (jm > 12) { jm = 1; jy += 1; }
      return { jy, jm };
    });
  };

  const isToday = (d: number) => d === tj.jd && view.jm === tj.jm && view.jy === tj.jy;

  return (
    <div className="theme-card">
      <div className="flex items-center justify-between mb-4">
        <Button className="theme-btn-secondary" size="small" icon={<RightOutlined />} onClick={() => changeMonth(-1)} />
        <div className="text-center">
          <div className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
            {JALALI_MONTHS[view.jm - 1]} {faDigits(view.jy)}
          </div>
        </div>
        <Button className="theme-btn-secondary" size="small" icon={<LeftOutlined />} onClick={() => changeMonth(1)} />
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_SHORT.map((w, i) => (
          <div key={i} className="h-8 flex items-center justify-center text-xs font-bold" style={{ color: "var(--accent-color)" }}>
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => (
          <div
            key={i}
            className="h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all"
            style={
              d === null
                ? {}
                : isToday(d)
                ? { background: "var(--btn-primary-bg)", color: "#fff", boxShadow: "var(--btn-primary-shadow)", fontWeight: 800 }
                : { color: "var(--text-primary)", background: "var(--bg-hover)" }
            }
          >
            {d !== null ? faDigits(d) : ""}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
        <span className="inline-block w-3 h-3 rounded" style={{ background: "var(--btn-primary-bg)" }} />
        امروز: {faDigits(tj.jd)} {JALALI_MONTHS[tj.jm - 1]}
      </div>
    </div>
  );
}
