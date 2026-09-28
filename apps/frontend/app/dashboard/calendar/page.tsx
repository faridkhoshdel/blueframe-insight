"use client";

import { Typography, Row, Col } from "antd";
import PersianClock from "@/components/PersianClock";
import PersianCalendar from "@/components/PersianCalendar";
import { toJalali, faDigits, isLeapJalali, jalaliYearLength, jalaliDayOfYear, JALALI_MONTHS } from "@/lib/jalali";

const { Title } = Typography;

export default function CalendarPage() {
  const now = new Date();
  const j = toJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const dayOfYear = jalaliDayOfYear(j.jy, j.jm, j.jd);
  const yearLen = jalaliYearLength(j.jy);
  const remaining = yearLen - dayOfYear;

  const stats = [
    { label: "ماه جاری", value: JALALI_MONTHS[j.jm - 1], icon: "📆" },
    { label: "روز از سال", value: faDigits(dayOfYear), icon: "🌤️" },
    { label: "روز باقی‌مانده", value: faDigits(remaining), icon: "⏳" },
    { label: "سال کبیسه", value: isLeapJalali(j.jy) ? "بله" : "خیر", icon: "🔄" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Title level={2} className="theme-title" style={{ margin: 0 }}>📅 تقویم و ساعت</Title>
      <p className="theme-subtitle text-sm mt-1 mb-6">تقویم شمسی و ساعت زنده</p>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <PersianClock />
          <div className="grid grid-cols-2 gap-3 mt-4">
            {stats.map((s, i) => (
              <div key={i} className="theme-card text-center" style={{ padding: "14px" }}>
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</div>
                <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Col>
        <Col xs={24} lg={14}>
          <PersianCalendar />
        </Col>
      </Row>
    </div>
  );
}
