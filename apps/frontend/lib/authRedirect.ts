export type Role =
  | "ADMIN"
  | "EXECUTIVE"
  | "WAREHOUSE_MANAGER"
  | "DISTRIBUTOR_MANAGER"
  | "DRIVER"
  | "SALES_MANAGER"
  | "AI_OPERATOR"
  | "CUSTOMER";

// صفحه پیش‌فرض هر نقش پس از login
export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/dashboard/executive",
  EXECUTIVE: "/dashboard/executive",
  WAREHOUSE_MANAGER: "/dashboard/inventory",
  DISTRIBUTOR_MANAGER: "/dashboard/distributors",
  DRIVER: "/dashboard/routes",
  SALES_MANAGER: "/dashboard/invoices",
  AI_OPERATOR: "/dashboard/agents",
  CUSTOMER: "/dashboard/executive",
};

export function getHomePath(role: Role | null): string {
  if (!role) return "/login";
  return ROLE_HOME[role] || "/dashboard/executive";
}
