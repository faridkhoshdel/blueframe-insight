"use client";
import { useState, useEffect } from "react";

export default function AIInsightsPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    try {
      const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/crm/customers");
      setCustomers(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const analyzeCustomer = async (customerId: string) => {
    setAnalyzing(true);
    try {
      const [leadRes, churnRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/ai/lead-score/${customerId}`, { method: "POST" }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/ai/churn-risk/${customerId}`, { method: "POST" }),
      ]);
      const leadData = await leadRes.json();
      const churnData = await churnRes.json();
      setSelectedCustomer({ ...leadData, ...churnData });
    } catch (e) { console.error(e); }
    finally { setAnalyzing(false); }
  };

  const analyzeAll = async () => {
    setAnalyzing(true);
    try {
      await fetch("${process.env.NEXT_PUBLIC_API_URL}/crm/ai/analyze-all", { method: "POST" });
      alert("تحلیل همه مشتریان با موفقیت انجام شد");
      loadCustomers();
    } catch (e) { console.error(e); }
    finally { setAnalyzing(false); }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (score >= 40) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getChurnColor = (risk: number) => {
    if (risk > 0.7) return "text-red-600 bg-red-50 border-red-200";
    if (risk > 0.4) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-blueframe">هوش مصنوعی و Predictive Analytics</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Lead Scoring، پیش‌بینی Churn و Explainable AI</p>
        </div>
        <button
          onClick={analyzeAll}
          disabled={analyzing}
          className="px-5 py-2.5 bg-blueframe text-white rounded-lg shadow-soft hover:bg-blueframe-dark disabled:opacity-50 text-sm"
        >
          {analyzing ? "در حال تحلیل..." : "🤖 تحلیل AI همه مشتریان"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-soft border">
          <div className="p-4 border-b">
            <h3 className="font-bold">مشتریان</h3>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>
            ) : customers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">مشتری ثبت نشده</div>
            ) : customers.map(c => (
              <div key={c.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => analyzeCustomer(c.id)}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold">{c.name}</h4>
                    <p className="text-xs text-gray-500">{c.company || c.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    Score: {c.leadScore || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border">
          <div className="p-4 border-b">
            <h3 className="font-bold">تحلیل AI</h3>
          </div>
          {selectedCustomer ? (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border-2 ${getScoreColor(selectedCustomer.leadScore)}`}>
                  <p className="text-xs opacity-70">Lead Score</p>
                  <p className="text-3xl font-bold">{selectedCustomer.leadScore}</p>
                  <p className="text-sm font-medium mt-1">{selectedCustomer.tier}</p>
                </div>
                <div className={`p-4 rounded-xl border-2 ${getChurnColor(selectedCustomer.churnRisk)}`}>
                  <p className="text-xs opacity-70">Churn Risk</p>
                  <p className="text-3xl font-bold">{(selectedCustomer.churnRisk * 100).toFixed(0)}%</p>
                  <p className="text-sm font-medium mt-1">{selectedCustomer.riskLevel}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-bold text-blue-900 mb-2">💡 AI Insight:</p>
                <p className="text-sm text-blue-800">{selectedCustomer.aiInsights}</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">عوامل مؤثر (XAI):</h4>
                <div className="space-y-2">
                  {selectedCustomer.explanations?.map((exp: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{exp.factor}</span>
                      <span className={`text-sm font-bold ${exp.impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {exp.impact >= 0 ? '+' : ''}{exp.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedCustomer.recommendations?.length > 0 && (
                <div>
                  <h4 className="font-bold mb-2">پیشنهادات اقدام:</h4>
                  <ul className="space-y-1">
                    {selectedCustomer.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-blueframe mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              یک مشتری از لیست انتخاب کنید تا تحلیل AI نمایش داده شود
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
