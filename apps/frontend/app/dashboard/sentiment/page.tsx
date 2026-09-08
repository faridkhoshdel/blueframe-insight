"use client";

import { useState } from "react";

export default function SentimentPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!text.trim()) {
      setError("لطفاً متنی را برای تحلیل وارد کنید.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/sentiment/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
      else setError("خطا در تحلیل متن");
    } catch (e) {
      setError("عدم اتصال به سرور بک‌اند");
    } finally {
      setLoading(false);
    }
  };

  const getSentimentStyle = (emotion: string) => {
    if (emotion === "Satisfied") return "bg-green-50 border-green-300 text-green-900";
    if (emotion === "Angry") return "bg-red-50 border-red-300 text-red-900";
    return "bg-gray-50 border-gray-300 text-gray-900";
  };

  const getEmotionText = (emotion: string) => {
    if (emotion === "Satisfied") return "راضی و مثبت 😊";
    if (emotion === "Angry") return "ناراضی و منفی 😠";
    return "خنثی 😐";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-blueframe mb-2">تحلیل احساسات مشتریان (AI)</h1>
        <p className="text-gray-600">متن نظرات، بازخوردها یا تیکت‌ها را وارد کنید تا هوش مصنوعی احساسات پنهان را استخراج کند.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-200 space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="مثال: محصول عالی بود و خیلی سریع ارسال شد، ممنون از تیم خوب شما..."
          className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueframe focus:border-transparent outline-none resize-none font-sans"
          dir="rtl"
        />
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        <button
          onClick={analyze}
          disabled={loading}
          className="w-full md:w-auto px-8 py-3 bg-blueframe text-white rounded-lg shadow-soft hover:bg-blueframe-dark transition-all disabled:opacity-50 font-medium"
        >
          {loading ? "در حال تحلیل..." : "تحلیل هوشمند"}
        </button>
      </div>

      {result && (
        <div className={"p-6 rounded-xl border-2 space-y-4 " + getSentimentStyle(result.emotion)}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xl font-bold">نتیجه تحلیل</h3>
            <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-white/80">
              امتیاز: {result.score > 0 ? "+" : ""}{result.score}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold opacity-70 mb-1">احساس تشخیص‌داده‌شده:</p>
              <p className="text-2xl font-bold">{getEmotionText(result.emotion)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold opacity-70 mb-1">خلاصه هوش مصنوعی:</p>
              <p className="leading-relaxed">{result.aiSummary}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-black/10">
            <p className="text-sm font-semibold opacity-70 mb-2">پیشنهادات اقدام (Action Items):</p>
            <ul className="space-y-2">
              {result.recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-current flex-shrink-0"></span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-black/10">
            <p className="text-xs opacity-60">زمان تحلیل: {result.timestamp}</p>
          </div>
        </div>
      )}
    </div>
  );
}
