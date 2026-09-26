// تبدیل تقویم میلادی <-> شمسی (الگوریتم استاندارد jalaali)

function div(a: number, b: number) { return ~~(a / b); }
function mod(a: number, b: number) { return a - ~~(a / b) * b; }

export interface JalaliDate { jy: number; jm: number; jd: number; }

export const JALALI_MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
export const PERSIAN_WEEKDAYS = ["شنبه","یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه"];
export const WEEKDAY_SHORT = ["ش","ی","د","س","چ","پ","ج"];

export function toJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = -355665 + 365 * gy + ~~((gy2 + 3) / 4) - ~~((gy2 + 99) / 100) + ~~((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
  let jy = -1595 + 33 * div(days, 12053);
  days = mod(days, 12053);
  jy += 4 * div(days, 1461);
  days = mod(days, 1461);
  if (days > 365) {
    jy += div(days - 1, 365);
    days = mod(days - 1, 365);
  }
  let jm: number, jd: number;
  if (days < 186) { jm = 1 + div(days, 31); jd = 1 + mod(days, 31); }
  else { jm = 7 + div(days - 186, 30); jd = 1 + mod(days - 186, 30); }
  return { jy, jm, jd };
}

export function toGregorian(jy: number, jm: number, jd: number) {
  jy += 1595;
  let days = -355665 + 365 * jy + 8 * div(jy, 33) + div(mod(jy, 33) + 3, 4) + jd + ((jm < 7) ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * div(days, 146097);
  days = mod(days, 146097);
  if (days > 36524) {
    days -= 1;
    gy += 100 * div(days, 36524);
    days = mod(days, 36524);
    if (days >= 365) days++;
  }
  gy += 4 * div(days, 1461);
  days = mod(days, 1461);
  if (days > 365) {
    gy += div(days - 1, 365);
    days = mod(days - 1, 365);
  }
  let gd = days + 1;
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  while (gm < 13 && gd > sal_a[gm]) gd -= sal_a[gm++];
  return { gy, gm, gd };
}

export function isLeapJalali(jy: number): boolean {
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(mod(jy, 33));
}

export function jalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isLeapJalali(jy) ? 30 : 29;
}

export function jalaliYearLength(jy: number): number {
  return isLeapJalali(jy) ? 366 : 365;
}

export function persianWeekdayIndex(date: Date): number {
  return (date.getDay() + 1) % 7;
}

export function faDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);
}

export function formatJalaliDate(date: Date, withWeekday = true): string {
  const { jy, jm, jd } = toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const wd = PERSIAN_WEEKDAYS[persianWeekdayIndex(date)];
  return withWeekday
    ? `${wd} ${faDigits(jd)} ${JALALI_MONTHS[jm - 1]} ${faDigits(jy)}`
    : `${faDigits(jd)} ${JALALI_MONTHS[jm - 1]} ${faDigits(jy)}`;
}

export function formatTimeFa(date: Date, withSeconds = true): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return withSeconds ? faDigits(`${h}:${m}:${s}`) : faDigits(`${h}:${m}`);
}

export function jalaliDayOfYear(jy: number, jm: number, jd: number): number {
  let sum = jd;
  for (let i = 1; i < jm; i++) sum += jalaliMonthLength(jy, i);
  return sum;
}
