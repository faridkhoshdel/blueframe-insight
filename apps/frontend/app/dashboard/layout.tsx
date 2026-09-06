"use client";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const menuItems = [
  { name: "📊 Executive", href: "/dashboard/executive", icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" },
  { name: "داشبورد اصلی", href: "/dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { name: "تحلیل احساسات", href: "/dashboard/sentiment", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { name: "انبار و توزیع", href: "/dashboard/inventory", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" },
  { name: "فروش و CRM", href: "/dashboard/sales", icon: "M12 20V10M18 20V4M6 20v-4" },
  { name: "Knowledge Graph", href: "/dashboard/graph", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { name: "هوش مصنوعی", href: "/dashboard/ai-insights", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { name: "Multimodal AI", href: "/dashboard/multimodal", icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" },
  { name: "Autonomous Agents", href: "/dashboard/agents", icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" },
  { name: "Digital Twin", href: "/dashboard/simulator", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { name: "تحلیل و بصری", href: "/dashboard/analytics", icon: "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" },
  { name: "تنظیمات", href: "/dashboard/settings", icon: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAuthenticated, isLoading } = useAuth();
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
          <p className="text-gray-600 text-sm">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      {/* ===== Grid Layout: دسکتاپ با grid، موبایل با drawer ===== */}
      <div className="min-h-screen md:grid md:grid-cols-[256px_1fr]">
        
        {/* ===== Sidebar Desktop (Grid Column 1) ===== */}
        <aside className="hidden md:flex md:flex-col bg-white border-l border-gray-200 sticky top-0 h-screen overflow-y-auto">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <Image 
              src="https://faridkhoshdel.ir/wp-content/uploads/2026/06/blueframe.png" 
              alt="Logo" 
              width={40} 
              height={40} 
            />
            <div>
              <span className="font-bold text-blueframe text-lg block">پنل مدیریت</span>
              <span className="text-xs text-gray-500">blueFrame Insight</span>
            </div>
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
                      : "text-gray-600 hover:bg-blueframe/5 hover:text-blueframe"
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

          <div className="p-4 border-t border-gray-100">
            <div className="px-4 py-3 bg-blueframe/5 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{user?.name || "کاربر"}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
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
          <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="باز کردن منو"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">داشبورد مدیریتی</h2>
              <ThemeToggle />
              <div className="w-8 h-8 bg-blueframe/10 rounded-full flex items-center justify-center">
                <span className="text-blueframe font-bold text-sm">م</span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-4 md:p-8">
            {children}
          </div>

          {/* Footer */}
          <footer className="w-full text-center py-4 text-xs text-gray-400 bg-white border-t">
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
          fixed top-0 right-0 bottom-0 w-72 bg-white z-50
          flex flex-col shadow-2xl
          transition-transform duration-300 ease-out
          md:hidden
          ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-l from-blueframe/5 to-transparent">
          <div className="flex items-center gap-3">
            <Image 
              src="https://faridkhoshdel.ir/wp-content/uploads/2026/06/blueframe.png" 
              alt="Logo" 
              width={36} 
              height={36} 
            />
            <div>
              <span className="font-bold text-blueframe text-base block">پنل مدیریت</span>
              <span className="text-xs text-gray-500">blueFrame Insight</span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
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
                    : "text-gray-600 hover:bg-blueframe/5"
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

        <div className="p-4 border-t border-gray-100">
          <div className="px-4 py-3 bg-blueframe/5 rounded-lg">
            <p className="text-sm font-medium text-gray-900">{user?.name || "کاربر"}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
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
