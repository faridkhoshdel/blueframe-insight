"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("SALES");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login, register, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = isLogin
        ? await login(email, password)
        : await register(email, password, name, role);

      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "خطا در ورود");
      }
    } catch (e) {
      setError("خطای غیرمنتظره");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blueframe via-blue-600 to-blueframe-dark">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blueframe via-blue-600 to-blueframe-dark p-4" dir="rtl">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                            radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
            <Image
              src="https://faridkhoshdel.ir/wp-content/uploads/2026/06/blueframe.png"
              alt="blueFrame"
              width={60}
              height={60}
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">blueFrame Insight</h1>
          <p className="text-blue-100 text-sm">پلتفرم هوشمند مدیریت کسب‌وکار</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={"flex-1 py-2.5 rounded-lg font-bold text-sm transition " +
                (isLogin ? "bg-white text-blueframe shadow" : "text-gray-600")}
            >
              ورود
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={"flex-1 py-2.5 rounded-lg font-bold text-sm transition " +
                (!isLogin ? "bg-white text-blueframe shadow" : "text-gray-600")}
            >
              ثبت‌نام
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">نام کامل</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلاً: فرید خوشدل"
                  required={!isLogin}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueframe focus:border-transparent text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">ایمیل</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueframe focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">رمز عبور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueframe focus:border-transparent text-sm"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">نقش</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueframe focus:border-transparent text-sm"
                >
                  <option value="SALES">فروش</option>
                  <option value="SUPPORT">پشتیبانی</option>
                  <option value="MANAGER">مدیر</option>
                  <option value="ADMIN">مدیر سیستم</option>
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blueframe text-white rounded-lg font-bold disabled:opacity-50 hover:bg-blueframe-dark transition shadow-lg text-sm"
            >
              {loading ? "⏳ در حال پردازش..." : isLogin ? "🚀 ورود به پنل" : "✨ ساخت حساب"}
            </button>
          </form>

          {/* Demo credentials */}
          {isLogin && (
            <div className="mt-5 pt-5 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500 mb-2">دسترسی سریع (دمو):</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setEmail("admin@blueframe.ir"); setPassword("admin123"); }}
                  className="text-xs px-3 py-2 bg-blue-50 text-blueframe rounded-lg hover:bg-blue-100 transition"
                >
                  👑 Admin
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail("sales@blueframe.ir"); setPassword("sales123"); }}
                  className="text-xs px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                >
                  💼 Sales
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-blue-100 mt-6">
          Designed by <span className="font-bold text-white">blueFrame studio</span>
        </p>
      </div>
    </div>
  );
}
