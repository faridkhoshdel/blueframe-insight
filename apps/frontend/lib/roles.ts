import { Role } from "./authRedirect";

export interface MenuItem {
  name: string;
  href: string;
  icon: string;
  roles: Role[];
}

export const MENU_ITEMS: MenuItem[] = [
  { name: "خلاصه اجرایی", href: "/dashboard/executive", icon: "📊", roles: ["ADMIN", "EXECUTIVE"] },
  { name: "نمودار دانش", href: "/dashboard/graph", icon: "🕸️", roles: ["ADMIN"] },
  { name: "شبیه‌ساز", href: "/dashboard/simulator", icon: "🎮", roles: ["ADMIN"] },
  { name: "انبار و محصولات", href: "/dashboard/inventory", icon: "📦", roles: ["ADMIN", "WAREHOUSE_MANAGER"] },
  { name: "توزیع‌کنندگان", href: "/dashboard/distributors", icon: "🏢", roles: ["ADMIN", "DISTRIBUTOR_MANAGER"] },
  { name: "مسیرها", href: "/dashboard/routes", icon: "🚚", roles: ["ADMIN", "DISTRIBUTOR_MANAGER", "DRIVER"] },
  { name: "فاکتورها", href: "/dashboard/invoices", icon: "🧾", roles: ["ADMIN", "SALES_MANAGER", "DISTRIBUTOR_MANAGER"] },
  { name: "CRM و فروش", href: "/dashboard/sales", icon: "💼", roles: ["ADMIN", "SALES_MANAGER"] },
  { name: "AI Agents", href: "/dashboard/agents", icon: "🤖", roles: ["ADMIN", "AI_OPERATOR"] },
  { name: "بینش‌های AI", href: "/dashboard/ai-insights", icon: "💡", roles: ["ADMIN", "AI_OPERATOR"] },
  { name: "تحلیل احساسات", href: "/dashboard/sentiment", icon: "😊", roles: ["ADMIN", "AI_OPERATOR"] },
  { name: "چندوجهی", href: "/dashboard/multimodal", icon: "🎤", roles: ["ADMIN", "AI_OPERATOR"] },
  { name: "تحلیل‌ها", href: "/dashboard/analytics", icon: "📈", roles: ["ADMIN", "EXECUTIVE"] },
  { name: "تقویم و ساعت", href: "/dashboard/calendar", icon: "📅", roles: ["ADMIN", "EXECUTIVE", "WAREHOUSE_MANAGER", "DISTRIBUTOR_MANAGER", "SALES_MANAGER", "AI_OPERATOR", "DRIVER"] },
  { name: "ظاهر و رنگ", href: "/dashboard/appearance", icon: "🎨", roles: ["ADMIN"] },
  { name: "تنظیمات", href: "/dashboard/settings", icon: "⚙️", roles: ["ADMIN"] },
];

export function filterMenuByRole(role: Role | null): MenuItem[] {
  if (!role) return [];
  if (role === "ADMIN") return MENU_ITEMS;
  return MENU_ITEMS.filter((m) => m.roles.includes(role));
}
