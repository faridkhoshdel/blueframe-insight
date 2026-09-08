"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { API_URL } from '@/lib/api';

// Dynamic imports for Recharts (SSR: false)
const LineChart = dynamic(() => import("recharts").then(m => m.LineChart), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(m => m.Line), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then(m => m.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const Area = dynamic(() => import("recharts").then(m => m.Area), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then(m => m.AreaChart), { ssr: false });

export default function ExecutiveDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch(`${API_URL}/executive/overview`);
      if (!res.ok) throw new Error("خطا در دریافت داده‌ها");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) => {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return new Intl.NumberFormat("fa-IR").format(Math.round(n));
  };

  const formatNumber = (n: number) => new Intl.NumberFormat("fa-IR").format(Math.round(n));
  const formatPercent = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(1) + "%";

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "positive": return "✅";
      case "warning": return "⚠️";
      case "critical": return "🚨";
      default: return "💡";
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "positive": return "bg-green-50 border-green-200 text-green-800";
      case "warning": return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "critical": return "bg-red-50 border-red-200 text-red-800";
      default: return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blueframe mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری داشبورد مدیریتی...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 font-bold">❌ خطا در بارگذاری داده‌ها</p>
        <p className="text-red-600 text-sm mt-2">{error || "خطای ناشناخته"}</p>
        <button onClick={loadData} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
          🔄 تلاش مجدد
        </button>
      </div>
    );
  }

  const { kpis, trends, insights, forecast, summary } = data;

  const kpiCards = [
    { label: "درآمد کل", value: formatCurrency(kpis.totalRevenue) + " ﷼", change: kpis.revenueChange, icon: "💰", color: "blue" },
    { label: "مشتریان فعال", value: formatNumber(kpis.totalCustomers), change: kpis.customerChange, icon: "👥", color: "green" },
    { label: "نرخ ریزش", value: kpis.churnRate.toFixed(1) + "%", change: kpis.churnChange, icon: "📉", color: "red", invertColor: true },
    { label: "Lead Score میانگین", value: Math.round(kpis.avgLeadScore), change: kpis.leadScoreChange, icon: "⭐", color: "yellow" },
    { label: "معاملات باز", value: formatNumber(kpis.openDeals), change: kpis.openDealsChange, icon: "🤝", color: "purple" },
    { label: "میانگین ارزش معامله", value: formatCurrency(kpis.avgDealValue) + " ﷼", change: kpis.avgDealValueChange, icon: "💎", color: "pink" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blueframe">📊 داشبورد Executive</h1>
          <p className="text-gray-600 mt-1 text-xs sm:text-sm">نمای کلی کسب‌وکار برای مدیران ارشد</p>
        </div>
        <button onClick={loadData} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 shadow-sm">
          🔄 بروزرسانی
        </button>
      </div>

      {/* Executive Summary */}
      {summary && (
        <div className="bg-gradient-to-l from-blueframe/10 to-blue-50 p-4 sm:p-5 rounded-xl border-2 border-blueframe/20">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🎯</div>
            <div className="flex-1">
              <h3 className="font-bold text-blueframe mb-1">خلاصه اجرایی</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((kpi, i) => {
          const isPositiveChange = kpi.invertColor ? kpi.change < 0 : kpi.change > 0;
          return (
            <div key={i} className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-2">
                <div className="text-2xl">{kpi.icon}</div>
                <span className={"text-xs font-bold px-2 py-0.5 rounded " + 
                  (isPositiveChange ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                  {formatPercent(kpi.change)}
                </span>
              </div>
              <p className="text-xs text-gray-500">{kpi.label}</p>
              <p className="text-base sm:text-lg font-bold text-gray-900 mt-1 truncate">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Trend */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📈</span>
            <span>روند درآمد (۶ ماه اخیر)</span>
          </h3>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip formatter={(value) => [formatCurrency(value as number) + " ﷼", "درآمد"]} />
                <Area type="monotone" dataKey="revenue" name="درآمد" stroke="#3B82F6" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deals & Customers */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>معاملات و مشتریان</span>
          </h3>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="deals" name="معاملات" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="customers" name="مشتریان" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Forecast */}
      {forecast && (
        <div className="bg-gradient-to-l from-purple-50 to-blue-50 p-4 sm:p-6 rounded-xl border border-purple-200">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <h3 className="font-bold text-purple-900 flex items-center gap-2 text-lg">
                <span>🔮</span>
                <span>پیش‌بینی ماه آینده</span>
              </h3>
              <p className="text-xs text-purple-700 mt-1">بر اساس تحلیل داده‌های تاریخی</p>
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(forecast.nextMonthRevenue)} ﷼
              </p>
              <p className="text-xs text-purple-700">
                اعتماد: {(forecast.confidence * 100).toFixed(0)}% • روند: 
                {forecast.trend === "up" ? " 📈 صعودی" : forecast.trend === "down" ? " 📉 نزولی" : " ➡️ پایدار"}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-purple-900">🎯 پیشنهادات استراتژیک:</p>
            <ul className="space-y-1">
              {forecast.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-purple-800">
                  <span className="text-purple-500 mt-0.5">●</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>💡</span>
          <span>بینش‌های کلیدی ({insights.length})</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((insight: any, i: number) => (
            <div key={i} className={"p-3 rounded-lg border-2 " + getInsightColor(insight.type)}>
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">{getInsightIcon(insight.type)}</div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{insight.title}</p>
                  <p className="text-xs mt-1 opacity-90">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-xs text-gray-400 py-2">
        آخرین بروزرسانی: {new Date(data.generatedAt).toLocaleString("fa-IR")}
      </div>
    </div>
  );
}
