"use client";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";
import PersianClock from "@/components/PersianClock";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const allMenuItems = [
    { name: "خلاصه اجرایی", href: "/dashboard/executive", icon: "📊" },
    { name: "نمودار دانش", href: "/dashboard/graph", icon: "🕸️" },
    { name: "شبیه‌ساز", href: "/dashboard/simulator", icon: "🎮" },
    { name: "انبار و محصولات", href: "/dashboard/inventory", icon: "📦" },
    { name: "توزیع‌کنندگان", href: "/dashboard/distributors", icon: "🏢" },
    { name: "مسیرها", href: "/dashboard/routes", icon: "🚚" },
    { name: "فاکتورها", href: "/dashboard/invoices", icon: "🧾" },
    { name: "CRM و فروش", href: "/dashboard/sales", icon: "💼" },
    { name: "AI Agents", href: "/dashboard/agents", icon: "🤖" },
    { name: "بینش‌های AI", href: "/dashboard/ai-insights", icon: "💡" },
    { name: "تحلیل احساسات", href: "/dashboard/sentiment", icon: "😊" },
    { name: "چندوجهی", href: "/dashboard/multimodal", icon: "🎤" },
    { name: "تحلیل‌ها", href: "/dashboard/analytics", icon: "📈" },
    { name: "تقویم و ساعت", href: "/dashboard/calendar", icon: "📅" },
    { name: "ظاهر و رنگ", href: "/dashboard/appearance", icon: "🎨" },
    { name: "تنظیمات", href: "/dashboard/settings", icon: "⚙️" },
  ];
  const menuItems = user?.role ? filterMenuByRole(user.role) : [];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const menuItems = user?.role ? filterMenuByRole(user.role) : [];
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);


  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blueframe mx-auto mb-3"></div>
          <p className="text-[var(--text-secondary)] text-sm">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]" dir="rtl">
      {/* ===== Grid Layout: دسکتاپ با grid، موبایل با drawer ===== */}
      <div className="min-h-screen md:grid md:grid-cols-[256px_1fr]">
        
        {/* ===== Sidebar Desktop (Grid Column 1) ===== */}
        <aside className="hidden md:flex md:flex-col bg-[var(--bg-card)] border-l border-[var(--border-color)] sticky top-0 h-screen overflow-y-auto">
          <div className="p-6 border-b border-[var(--border-color)] flex items-center gap-3">
            <Image 
              src="https://faridkhoshdel.ir/wp-content/uploads/2026/06/blueframe.png" 
              alt="Logo" className="rounded-xl" style={{ background: "#1e3a8a", padding: 4 }} 
              width={40} 
              height={40} 
            />
            <div>
              <span className="font-bold text-blueframe text-lg block">پنل مدیریت</span>
              <span className="text-xs text-[var(--text-secondary)]">Vira</span>
            </div>
          </div>

          <div className="px-4 py-2 border-b border-[var(--border-color)] flex justify-center">
            <PersianClock compact />
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blueframe text-white"
                      : "text-[var(--text-secondary)] hover:bg-blueframe/5 hover:text-blueframe"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon}/>
                  </svg>
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[var(--border-color)]">
            <div className="px-4 py-3 bg-blueframe/5 rounded-lg">
              <p className="text-sm font-medium text-[var(--text-primary)]">{user?.name || "کاربر"}</p>
              <p className="text-xs text-[var(--text-secondary)]">{user?.email}</p>
              <p className="text-xs text-blueframe mt-1">👑 {user?.role}</p>
              <Link href="/" className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium inline-block">
                خروج از پنل →
              </Link>
            </div>
          </div>
        </aside>

        {/* ===== Main Content (Grid Column 2) ===== */}
        <main className="min-h-screen flex flex-col">
          {/* Mobile Header */}
          <header className="md:hidden bg-[var(--bg-card)] border-b border-[var(--border-color)] px-4 py-3 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-[var(--bg-hover)] rounded-lg"
                aria-label="باز کردن منو"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <h2 className="text-base font-bold text-[var(--text-primary)]">داشبورد مدیریتی</h2>
              <ThemeToggle />
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border" style={{ borderColor: "#1e3a8a", background: "#1e3a8a", padding: 4 }}>
                <Image
                  src="https://faridkhoshdel.ir/wp-content/uploads/2026/06/blueframe.png"
                  alt="blueFrame logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-4 md:p-8">
            {children}
          </div>

          {/* Footer */}
          <footer className="w-full text-center py-4 text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] border-t">
            Designed and Developed by <a href="https://faridkhoshdel.ir" target="_blank" rel="noopener noreferrer" className="font-bold text-blueframe hover:text-blue-800 underline decoration-2 underline-offset-2 transition">blueFrame studio</a> — Designer: Farid Khoshdel
          </footer>
        </main>
      </div>

      {/* ===== Mobile Drawer (خارج از grid) ===== */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside 
        className={`
          fixed top-0 right-0 bottom-0 w-72 bg-[var(--bg-card)] z-50
          flex flex-col shadow-2xl
          transition-transform duration-300 ease-out
          md:hidden
          ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between grad-header">
          <div className="flex items-center gap-3">
            <Image 
              src="https://faridkhoshdel.ir/wp-content/uploads/2026/06/blueframe.png" 
              alt="Logo" className="rounded-xl" style={{ background: "#1e3a8a", padding: 4 }}
              width={36} 
              height={36} 
            />
            <div>
              <span className="font-bold text-blueframe text-base block">پنل مدیریت</span>
              <span className="text-xs text-[var(--text-secondary)]">Vira</span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blueframe text-white"
                    : "text-[var(--text-secondary)] hover:bg-blueframe/5"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}/>
                </svg>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border-color)]">
          <div className="px-4 py-3 bg-blueframe/5 rounded-lg">
            <p className="text-sm font-medium text-[var(--text-primary)]">{user?.name || "کاربر"}</p>
              <p className="text-xs text-[var(--text-secondary)]">{user?.email}</p>
              <p className="text-xs text-blueframe mt-1">👑 {user?.role}</p>
            <button onClick={() => { logout(); router.push("/login"); }} className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium">
              🚪 خروج از پنل
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
