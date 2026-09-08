"use client";
import { useState, useEffect } from "react";

const AGENT_CONFIG = {
  "RETENTION": { name: "Retention Agent", icon: "🛡️", color: "red", desc: "حفظ مشتریان در معرض خطر" },
  "NURTURE": { name: "Nurture Agent", icon: "🌱", color: "green", desc: "پرورش Lead های سرد" },
  "CROSS_SELL": { name: "Cross-sell Agent", icon: "🎯", color: "blue", desc: "فروش متقاطع به VIP ها" },
  "FOLLOW_UP": { name: "Follow-up Agent", icon: "⏰", color: "yellow", desc: "پیگیری معاملات راکد" },
};

export default function AgentsPage() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [runningAgent, setRunningAgent] = useState(null);
  const [filterType, setFilterType] = useState("ALL");

  useEffect(() => {
    loadData();
    // رفرش هر ۳۰ ثانیه
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        fetch("${process.env.NEXT_PUBLIC_API_URL}/agents/stats"),
        fetch("${process.env.NEXT_PUBLIC_API_URL}/agents/logs?limit=30"),
      ]);
      setStats(await statsRes.json());
      setLogs(await logsRes.json());
    } catch (e) { console.error(e); }
  };

  const runAgent = async (type: string) => {
    setRunningAgent(type);
    try {
      const endpoint = type === "ALL" ? "/agents/run-all" : `/agents/${type.toLowerCase().replace("_", "-")}`;
      await fetch("${process.env.NEXT_PUBLIC_API_URL}" + endpoint, { method: "POST" });
      await loadData();
    } catch (e) { console.error(e); alert("خطا در اجرای Agent"); }
    finally { setRunningAgent(null); }
  };

  const filteredLogs = filterType === "ALL" ? logs : logs.filter(l => l.agentType === filterType);
  const formatTime = (dateStr) => new Date(dateStr).toLocaleString("fa-IR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blueframe">🤖 Autonomous Agents</h1>
          <p className="text-gray-600 mt-1 text-xs sm:text-sm">عامل‌های خودکار هوشمند برای اقدامات تجاری</p>
        </div>
        <button
          onClick={() => runAgent("ALL")}
          disabled={runningAgent}
          className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blueframe text-white rounded-lg shadow-soft disabled:opacity-50 text-xs sm:text-sm font-bold"
        >
          {runningAgent === "ALL" ? "⏳ در حال اجرا..." : "🚀 اجرای همه Agent ها"}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-soft border">
            <p className="text-xs text-gray-500">کل اقدامات</p>
            <p className="text-2xl sm:text-3xl font-bold text-blueframe">{stats.totalActions}</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-soft border">
            <p className="text-xs text-gray-500">۲۴ ساعت اخیر</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.last24h}</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-soft border">
            <p className="text-xs text-gray-500">انواع فعال</p>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.byAgent.length}</p>
          </div>
          <div className="bg-gradient-to-l from-blueframe/10 to-blue-50 p-3 sm:p-4 rounded-xl border-2 border-blueframe/20">
            <p className="text-xs text-blueframe">وضعیت</p>
            <p className="text-sm sm:text-base font-bold text-blueframe">🟢 آنلاین</p>
          </div>
        </div>
      )}

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {Object.entries(AGENT_CONFIG).map(([type, config]) => {
          const agentStats = stats?.byAgent.find(b => b.type === type);
          const count = agentStats?.count || 0;
          const isRunning = runningAgent === type;
          
          return (
            <div key={type} className="bg-white rounded-xl shadow-soft border overflow-hidden">
              <div className={"p-4 sm:p-5 bg-gradient-to-l from-" + config.color + "-50 to-white border-b"}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl sm:text-4xl">{config.icon}</div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base">{config.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{config.desc}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{count}</span>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <button
                  onClick={() => runAgent(type)}
                  disabled={isRunning}
                  className={"w-full py-2 rounded-lg font-bold text-xs sm:text-sm transition " + 
                    (isRunning ? "bg-gray-100 text-gray-400" : "bg-blueframe/10 text-blueframe hover:bg-blueframe/20")}
                >
                  {isRunning ? "⏳ در حال اجرا..." : "▶️ اجرای دستی"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl shadow-soft border overflow-hidden">
        <div className="p-4 sm:p-5 border-b bg-gradient-to-l from-blueframe/5 to-transparent">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
              <span>📜</span>
              <span>Timeline فعالیت‌ها</span>
              <span className="text-xs text-gray-500">({filteredLogs.length} مورد)</span>
            </h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setFilterType("ALL")}
                className={"px-3 py-1 rounded-full text-xs whitespace-nowrap " + 
                  (filterType === "ALL" ? "bg-blueframe text-white" : "bg-gray-100 text-gray-600")}
              >
                همه
              </button>
              {Object.entries(AGENT_CONFIG).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={"px-3 py-1 rounded-full text-xs whitespace-nowrap " + 
                    (filterType === type ? "bg-blueframe text-white" : "bg-gray-100 text-gray-600")}
                >
                  {config.icon} {config.name.replace(" Agent", "")}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm">فعالیتی ثبت نشده است</p>
              <button onClick={() => runAgent("ALL")} className="mt-3 text-sm text-blueframe font-bold">
                اجرای Agent ها
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredLogs.map((log) => {
                const config = AGENT_CONFIG[log.agentType] || { icon: "🤖", name: log.agentName, color: "gray" };
                let metrics = {};
                try { metrics = JSON.parse(log.metrics || "{}"); } catch (e) {}
                
                return (
                  <div key={log.id} className="p-3 sm:p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start gap-3">
                      <div className={"flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-" + config.color + "-100 flex items-center justify-center text-xl sm:text-2xl"}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex-1">
                            <p className="font-bold text-sm">{config.name}</p>
                            <p className="text-xs text-gray-500">{log.action}</p>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">{formatTime(log.createdAt)}</span>
                        </div>
                        
                        <div className="mt-2 space-y-1.5">
                          <div className="text-xs">
                            <span className="font-bold text-gray-700">🎯 هدف: </span>
                            <span className="text-gray-600">{metrics.customerName || metrics.dealTitle || log.targetType}</span>
                          </div>
                          <div className="text-xs bg-blue-50 p-2 rounded border border-blue-100">
                            <span className="font-bold text-blue-900">💭 استدلال: </span>
                            <span className="text-blue-800">{log.reasoning}</span>
                          </div>
                          <div className="text-xs bg-green-50 p-2 rounded border border-green-100">
                            <span className="font-bold text-green-900">✅ نتیجه: </span>
                            <span className="text-green-800">{log.outcome}</span>
                          </div>
                          {metrics.churnRisk !== undefined && (
                            <div className="flex gap-2 flex-wrap">
                              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                                Churn: {(metrics.churnRisk * 100).toFixed(0)}%
                              </span>
                              {metrics.leadScore !== undefined && (
                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                  Score: {metrics.leadScore}
                                </span>
                              )}
                              {metrics.networkSize !== undefined && (
                                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                  Network: {metrics.networkSize}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-l from-purple-50 to-blue-50 p-4 sm:p-5 rounded-xl border border-purple-200">
        <h3 className="font-bold mb-2 flex items-center gap-2 text-sm sm:text-base">
          <span>💡</span>
          <span>درباره Autonomous Agents</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
          <div>
            <p className="font-bold text-purple-700 mb-1">🛡️ Retention Agent</p>
            <p className="text-gray-700">مشتریان با Churn Risk &gt; 50% را شناسایی و اقدامات حفظ (ایمیل، تماس مدیر، تخفیف) انجام می‌دهد.</p>
          </div>
          <div>
            <p className="font-bold text-green-700 mb-1">🌱 Nurture Agent</p>
            <p className="text-gray-700">Lead های سرد را با محتوای آموزشی شخصی‌سازی‌شده پرورش می‌دهد.</p>
          </div>
          <div>
            <p className="font-bold text-blue-700 mb-1">🎯 Cross-sell Agent</p>
            <p className="text-gray-700">با استفاده از Knowledge Graph، به مشتریان VIP محصولات مرتبط پیشنهاد می‌دهد.</p>
          </div>
          <div>
            <p className="font-bold text-yellow-700 mb-1">⏰ Follow-up Agent</p>
            <p className="text-gray-700">معاملات راکد (بیش از ۷ روز بدون فعالیت) را پیگیری می‌کند.</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
