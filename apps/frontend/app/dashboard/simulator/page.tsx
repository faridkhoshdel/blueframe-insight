"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { API_URL } from '@/lib/api';
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then(mod => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false });

export default function SimulatorPage() {
  const [activeTab, setActiveTab] = useState("price");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [pricePercent, setPricePercent] = useState(20);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [campaignSegment, setCampaignSegment] = useState("high_churn");
  const [campaignBudget, setCampaignBudget] = useState(5000000);
  const [compareResult, setCompareResult] = useState(null);
  const [compareScenarios, setCompareScenarios] = useState([
    { type: "price_change", value: 20 },
    { type: "marketing", segment: "high_value", budget: 10000000 },
  ]);
  const [history, setHistory] = useState([]);

  useEffect(() => { loadCustomers(); loadHistory(); }, []);

  const loadCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/crm/customers`);
      setCustomers(await res.json());
    } catch (e) { console.error(e); }
  };

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem("simulator_history");
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) { console.error(e); }
  };

  const saveToHistory = (item) => {
    const newHistory = [{ ...item, timestamp: new Date().toLocaleString("fa-IR"), id: Date.now() }, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem("simulator_history", JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("simulator_history");
  };

  const runSimulation = async () => {
    setLoading(true); setResult(null);
    try {
      let endpoint = "", body = {};
      if (activeTab === "price") { endpoint = `${API_URL}/simulator/price-change`; body = { percent: pricePercent }; }
      else if (activeTab === "customer_loss") {
        if (!selectedCustomerId) { alert("لطفاً یک مشتری انتخاب کنید"); setLoading(false); return; }
        endpoint = `${API_URL}/simulator/customer-loss/` + selectedCustomerId;
      } else if (activeTab === "marketing") { endpoint = `${API_URL}/simulator/marketing-campaign`; body = { segment: campaignSegment, budget: campaignBudget }; }
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      setResult(data);
      saveToHistory({ type: activeTab, result: data });
    } catch (e) { console.error(e); alert("خطا در اجرای شبیه‌سازی"); }
    finally { setLoading(false); }
  };

  const runComparison = async () => {
    setLoading(true); setCompareResult(null);
    try {
      const res = await fetch(`${API_URL}/simulator/compare`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scenarios: compareScenarios }) });
      const data = await res.json();
      setCompareResult(data);
      saveToHistory({ type: "compare", result: data });
    } catch (e) { console.error(e); alert("خطا در مقایسه سناریوها"); }
    finally { setLoading(false); }
  };

  const updateCompareScenario = (index, field, value) => {
    const updated = [...compareScenarios];
    updated[index] = { ...updated[index], [field]: value };
    setCompareScenarios(updated);
  };

  const addCompareScenario = () => {
    if (compareScenarios.length < 4) setCompareScenarios([...compareScenarios, { type: "price_change", value: 10 }]);
  };

  const removeCompareScenario = (index) => {
    if (compareScenarios.length > 2) setCompareScenarios(compareScenarios.filter((_, i) => i !== index));
  };

  const formatCurrency = (n) => new Intl.NumberFormat("fa-IR").format(Math.round(n));
  const formatMillions = (n) => (n / 1000000).toFixed(1) + "M";
  const getRiskColor = (level) => ({ "LOW": "text-green-600 bg-green-50 border-green-200", "MEDIUM": "text-yellow-600 bg-yellow-50 border-yellow-200", "HIGH": "text-orange-600 bg-orange-50 border-orange-200", "CRITICAL": "text-red-600 bg-red-50 border-red-200" }[level] || "text-gray-600 bg-gray-50 border-gray-200");
  const getRiskLabel = (level) => ({ "LOW": "پایین", "MEDIUM": "متوسط", "HIGH": "بالا", "CRITICAL": "بحرانی" }[level] || level);
  const getTypeLabel = (type) => ({ "price": "تغییر قیمت", "customer_loss": "از دست دادن", "marketing": "کمپین", "compare": "مقایسه" }[type] || type);

  const chartData = compareResult ? compareResult.comparison.map((c) => ({ name: c.name, revenue: c.revenueChange, isBest: c.name === compareResult.bestScenario })) : [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blueframe">🧪 Digital Twin Simulator</h1>
        <p className="text-gray-600 text-xs sm:text-sm">شبیه‌ساز تصمیم‌گیری سازمانی با مقایسه سناریوها</p>
      </div>

      {/* Info Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-700 font-bold">🧠 مبتنی بر AI</p>
          <p className="text-xs text-gray-700 mt-1 hidden sm:block">ترکیب Knowledge Graph + Churn</p>
        </div>
        <div className="bg-purple-50 p-3 sm:p-4 rounded-xl border border-purple-200">
          <p className="text-xs text-purple-700 font-bold">🔍 Explainable</p>
          <p className="text-xs text-gray-700 mt-1 hidden sm:block">توضیح کامل علت هر پیش‌بینی</p>
        </div>
        <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-200">
          <p className="text-xs text-green-700 font-bold">✅ Actionable</p>
          <p className="text-xs text-gray-700 mt-1 hidden sm:block">پیشنهادات عملی برای هر سناریو</p>
        </div>
      </div>

      {/* Tabs Card */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        {/* Tabs - Scrollable در موبایل */}
        <div className="flex border-b overflow-x-auto scrollbar-hide">
          {[
            { id: "price", name: "تغییر قیمت", icon: "💰" },
            { id: "customer_loss", name: "از دست دادن", icon: "👥" },
            { id: "marketing", name: "کمپین", icon: "📢" },
            { id: "compare", name: "مقایسه", icon: "⚖️" },
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => { setActiveTab(tab.id); setResult(null); setCompareResult(null); }}
              className={"flex-1 min-w-[100px] sm:min-w-[120px] p-3 sm:p-4 text-center whitespace-nowrap transition-all " + 
                (activeTab === tab.id ? "bg-blueframe text-white" : "hover:bg-gray-50")}
            >
              <span className="block sm:hidden">{tab.icon}</span>
              <p className="font-bold text-xs sm:text-sm mt-1 sm:mt-0">{tab.name}</p>
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Price Tab */}
          {activeTab === "price" && (
            <div className="space-y-4">
              <label className="block text-sm font-bold mb-2">
                درصد تغییر قیمت: <span className="text-blueframe">{pricePercent > 0 ? "+" : ""}{pricePercent}%</span>
              </label>
              <input 
                type="range" 
                min="-50" 
                max="100" 
                step="5" 
                value={pricePercent} 
                onChange={(e) => setPricePercent(Number(e.target.value))} 
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>-50%</span>
                <span>0</span>
                <span>+100%</span>
              </div>
            </div>
          )}

          {/* Customer Loss Tab */}
          {activeTab === "customer_loss" && (
            <div className="space-y-4">
              <label className="block text-sm font-bold mb-2">انتخاب مشتری:</label>
              <select 
                value={selectedCustomerId} 
                onChange={(e) => setSelectedCustomerId(e.target.value)} 
                className="w-full p-3 border rounded-lg text-sm"
              >
                <option value="">-- یک مشتری انتخاب کنید --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - Score: {c.leadScore}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Marketing Tab */}
          {activeTab === "marketing" && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Segment هدف:</label>
                <select 
                  value={campaignSegment} 
                  onChange={(e) => setCampaignSegment(e.target.value)} 
                  className="w-full p-3 border rounded-lg text-sm"
                >
                  <option value="high_churn">Churn بالا</option>
                  <option value="high_value">ارزش بالا</option>
                  <option value="cold_leads">Lead سرد</option>
                  <option value="all">همه مشتریان</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  بودجه: <span className="text-blueframe text-xs">{formatCurrency(campaignBudget)} ﷼</span>
                </label>
                <input 
                  type="range" 
                  min="1000000" 
                  max="100000000" 
                  step="1000000" 
                  value={campaignBudget} 
                  onChange={(e) => setCampaignBudget(Number(e.target.value))} 
                  className="w-full h-2 bg-gray-200 rounded-lg" 
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1M</span>
                  <span>100M</span>
                </div>
              </div>
            </div>
          )}

          {/* Compare Tab */}
          {activeTab === "compare" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-l from-blueframe/10 to-blue-50 p-4 rounded-lg border border-blueframe/20">
                <p className="text-sm font-bold text-blueframe mb-1">⚖️ مقایسه همزمان سناریوها</p>
                <p className="text-xs text-gray-700">تا ۴ سناریو را مقایسه کنید</p>
              </div>

              {compareScenarios.map((scenario, index) => (
                <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm">سناریو {index + 1}</p>
                    {compareScenarios.length > 2 && (
                      <button 
                        onClick={() => removeCompareScenario(index)} 
                        className="text-xs text-red-600 hover:text-red-700 px-2 py-1"
                      >
                        ✕ حذف
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select 
                      value={scenario.type} 
                      onChange={(e) => updateCompareScenario(index, "type", e.target.value)} 
                      className="p-2 border rounded-lg text-sm"
                    >
                      <option value="price_change">تغییر قیمت</option>
                      <option value="marketing">کمپین بازاریابی</option>
                    </select>
                    {scenario.type === "price_change" && (
                      <input 
                        type="number" 
                        value={scenario.value || 0} 
                        onChange={(e) => updateCompareScenario(index, "value", Number(e.target.value))} 
                        placeholder="درصد" 
                        className="p-2 border rounded-lg text-sm" 
                      />
                    )}
                    {scenario.type === "marketing" && (
                      <>
                        <select 
                          value={scenario.segment || "all"} 
                          onChange={(e) => updateCompareScenario(index, "segment", e.target.value)} 
                          className="p-2 border rounded-lg text-sm"
                        >
                          <option value="high_churn">Churn بالا</option>
                          <option value="high_value">ارزش بالا</option>
                          <option value="cold_leads">Lead سرد</option>
                          <option value="all">همه</option>
                        </select>
                        <input 
                          type="number" 
                          value={scenario.budget || 5000000} 
                          onChange={(e) => updateCompareScenario(index, "budget", Number(e.target.value))} 
                          placeholder="بودجه" 
                          className="p-2 border rounded-lg text-sm" 
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}

              {compareScenarios.length < 4 && (
                <button 
                  onClick={addCompareScenario} 
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blueframe hover:text-blueframe"
                >
                  + افزودن سناریو ({compareScenarios.length}/4)
                </button>
              )}
            </div>
          )}

          <button 
            onClick={activeTab === "compare" ? runComparison : runSimulation} 
            disabled={loading}
            className="w-full py-3 bg-blueframe text-white rounded-lg font-bold disabled:opacity-50 hover:bg-blueframe-dark transition"
          >
            {loading ? "⏳ در حال پردازش..." : activeTab === "compare" ? "⚖️ مقایسه سناریوها" : "🚀 اجرای شبیه‌سازی"}
          </button>
        </div>
      </div>

      {/* Compare Results */}
      {activeTab === "compare" && compareResult && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl shadow border p-4 sm:p-6">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">نتایج مقایسه</h2>
                <p className="text-gray-600 mt-1 text-xs sm:text-sm">{compareResult.comparison.length} سناریو مقایسه شد</p>
              </div>
              <div className="px-3 sm:px-4 py-2 rounded-lg border-2 border-green-200 bg-green-50">
                <p className="text-xs text-green-700">🏆 بهترین</p>
                <p className="font-bold text-green-800 text-xs sm:text-sm">{compareResult.bestScenario}</p>
              </div>
            </div>

            <div className="w-full h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis fontSize={10} tickFormatter={(v) => formatMillions(v)} />
                  <Tooltip formatter={(value) => [formatCurrency(value) + " ﷼", "تغییر درآمد"]} />
                  <Legend />
                  <Bar dataKey="revenue" name="تغییر درآمد" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.isBest ? "#10B981" : entry.revenue >= 0 ? "#3B82F6" : "#EF4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 sm:mt-6">
              {compareResult.comparison.map((c, i) => (
                <div 
                  key={i} 
                  className={"p-3 sm:p-4 rounded-lg border-2 " + 
                    (c.name === compareResult.bestScenario ? "border-green-300 bg-green-50" : "border-gray-200")}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-xs sm:text-sm">{c.name}</p>
                    {c.name === compareResult.bestScenario && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">🏆</span>
                    )}
                  </div>
                  <p className={"text-base sm:text-lg font-bold " + (c.revenueChange >= 0 ? "text-green-600" : "text-red-600")}>
                    {c.revenueChange >= 0 ? "+" : ""}{formatCurrency(c.revenueChange)} ﷼
                  </p>
                  <div className={"inline-block mt-2 px-2 py-1 rounded text-xs " + getRiskColor(c.riskLevel)}>
                    ریسک: {getRiskLabel(c.riskLevel)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Single Scenario Results */}
      {activeTab !== "compare" && result && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl shadow border p-4 sm:p-6">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">{result.scenarioName}</h2>
                <p className="text-gray-600 mt-1 text-xs sm:text-sm">{result.description}</p>
              </div>
              <div className={"px-3 sm:px-4 py-2 rounded-lg border-2 " + getRiskColor(result.impact.riskLevel)}>
                <p className="text-xs opacity-70">سطح ریسک</p>
                <p className="font-bold text-sm">{getRiskLabel(result.impact.riskLevel)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs text-gray-500">تغییر درآمد</p>
                <p className={"text-sm sm:text-xl font-bold " + (result.impact.revenueChange >= 0 ? "text-green-600" : "text-red-600")}>
                  {result.impact.revenueChange >= 0 ? "+" : ""}{formatCurrency(result.impact.revenueChange)} ﷼
                </p>
                <p className="text-xs text-gray-500 mt-1">({result.impact.revenueChangePercent.toFixed(1)}%)</p>
              </div>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs text-gray-500">تعداد تحت تأثیر</p>
                <p className="text-xl sm:text-2xl font-bold text-blueframe">
                  {result.impact.customerLoss + result.impact.affectedCustomers.length}
                </p>
              </div>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs text-gray-500">اعتماد مدل</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{(result.confidence * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs text-gray-500">تغییر Churn</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">{result.impact.churnRateChange.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-4 sm:p-6">
            <h3 className="font-bold mb-3 text-sm sm:text-base">🧠 تحلیل‌های هوش مصنوعی:</h3>
            <ul className="space-y-2">
              {result.insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                  <span className="text-blue-600 mt-1 flex-shrink-0">●</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow border p-4 sm:p-6">
            <h3 className="font-bold mb-3 text-sm sm:text-base">✅ پیشنهادات اقدام:</h3>
            <div className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <span className="text-blueframe mt-1 flex-shrink-0">→</span>
                  <span className="text-xs sm:text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {result.impact.affectedCustomers && result.impact.affectedCustomers.length > 0 && (
            <div className="bg-white rounded-xl shadow border p-4 sm:p-6">
              <h3 className="font-bold mb-3 text-sm sm:text-base">
                مشتریان تحت تأثیر ({result.impact.affectedCustomers.length}):
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {result.impact.affectedCustomers.map((c, i) => (
                  <div key={i} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-xs sm:text-sm">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.company || ""}</p>
                    </div>
                    <div className="text-left">
                      {c.lostRevenue !== undefined && (
                        <p className="text-xs sm:text-sm font-bold text-red-600">-{formatCurrency(c.lostRevenue)} ﷼</p>
                      )}
                      {c.probability !== undefined && (
                        <p className="text-xs text-gray-500">احتمال: {c.probability}%</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow border p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm sm:text-base">📜 تاریخچه ({history.length})</h3>
            <button 
              onClick={clearHistory} 
              className="text-xs text-red-600 hover:text-red-700 px-2 sm:px-3 py-1 rounded border border-red-200"
            >
              پاک کردن
            </button>
          </div>
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs sm:text-sm font-medium">{getTypeLabel(item.type)}</p>
                  <p className="text-xs text-gray-500">{item.timestamp}</p>
                </div>
                <div className="text-left">
                  {item.result?.impact?.revenueChange !== undefined && (
                    <p className={"text-xs sm:text-sm font-bold " + (item.result.impact.revenueChange >= 0 ? "text-green-600" : "text-red-600")}>
                      {item.result.impact.revenueChange >= 0 ? "+" : ""}{formatCurrency(item.result.impact.revenueChange)} ﷼
                    </p>
                  )}
                  {item.result?.bestScenario && (
                    <p className="text-xs text-green-600">🏆 {item.result.bestScenario}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
