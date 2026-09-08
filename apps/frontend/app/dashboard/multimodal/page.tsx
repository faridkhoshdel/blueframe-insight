"use client";
import { useState, useEffect, useRef } from "react";
import { API_URL } from '@/lib/api';

const TYPE_CONFIG = {
  voice: { name: "صوت", icon: "🎙️", color: "red" },
  image: { name: "تصویر", icon: "📸", color: "blue" },
  long_text: { name: "متن", icon: "📝", color: "green" },
};

export default function MultimodalPage() {
  const [activeTab, setActiveTab] = useState("voice");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [text, setText] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/multimodal/all?limit=20`);
      setHistory(await res.json());
    } catch (e) { console.error(e); }
  };

  const analyzeText = async () => {
    if (!text.trim()) { alert("لطفاً متنی وارد کنید"); return; }
    setLoading(true); setResult(null);
    try {
      const res = await fetch(`${API_URL}/multimodal/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, title: textTitle || "بدون عنوان" }),
      });
      const data = await res.json();
      setResult(data);
      loadHistory();
      setText(""); setTextTitle("");
    } catch (e) { alert("خطا در تحلیل متن"); }
    finally { setLoading(false); }
  };

  const analyzeFile = async (file, type) => {
    setLoading(true); setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_URL}/multimodal/${type}`, { method: "POST", body: formData });
      const data = await res.json();
      setResult(data);
      loadHistory();
    } catch (e) { alert("خطا در تحلیل فایل"); }
    finally { setLoading(false); }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([audioBlob], `recording-${Date.now()}.webm`, { type: "audio/webm" });
        analyzeFile(file, "voice");
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (e) {
      alert("دسترسی به میکروفون رد شد.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) analyzeFile(file, type);
  };

  const getSentimentColor = (label) => ({ positive: "text-green-600 bg-green-50", negative: "text-red-600 bg-red-50", neutral: "text-gray-600 bg-gray-50" }[label] || "text-gray-600 bg-gray-50");
  const getSentimentLabel = (label) => ({ positive: "مثبت 😊", negative: "منفی 😔", neutral: "خنثی 😐" }[label] || label);
  const formatTime = (d) => new Date(d).toLocaleString("fa-IR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });

  const emotions = result?.emotions ? (() => { try { return JSON.parse(result.emotions); } catch { return {}; } })() : {};
  const metadata = result?.metadata ? (() => { try { return JSON.parse(result.metadata); } catch { return {}; } })() : {};

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blueframe">🎙️ Multimodal AI</h1>
        <p className="text-gray-600 mt-1 text-xs sm:text-sm">تحلیل احساسات صوت، تصویر و متون طولانی به فارسی</p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
          <p className="text-xs text-red-700 font-bold">🎙️ تحلیل صوت</p>
          <p className="text-xs text-gray-700 mt-1">Whisper + احساسات</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-700 font-bold">📸 تحلیل تصویر</p>
          <p className="text-xs text-gray-700 mt-1">Vision + چهره‌خوانی</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <p className="text-xs text-green-700 font-bold">📝 خلاصه‌سازی</p>
          <p className="text-xs text-gray-700 mt-1">متون طولانی</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="flex border-b overflow-x-auto scrollbar-hide">
          {Object.entries(TYPE_CONFIG).map(([type, config]) => (
            <button
              key={type}
              onClick={() => { setActiveTab(type); setResult(null); }}
              className={"flex-1 min-w-[100px] p-3 sm:p-4 text-center whitespace-nowrap " + 
                (activeTab === type ? "bg-blueframe text-white" : "hover:bg-gray-50")}
            >
              <span className="text-xl sm:text-2xl">{config.icon}</span>
              <p className="font-bold text-xs sm:text-sm mt-1">{config.name}</p>
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {activeTab === "voice" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border-2 border-red-200 text-center">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={"w-24 h-24 rounded-full shadow-lg transition-all mx-auto flex items-center justify-center " + 
                    (isRecording ? "bg-red-600 animate-pulse scale-110" : "bg-red-500 hover:bg-red-600")}
                >
                  <span className="text-white text-4xl">{isRecording ? "⏹" : "🎙️"}</span>
                </button>
                <p className="mt-3 text-sm font-bold text-red-800">
                  {isRecording ? `⏺ در حال ضبط... ${recordingTime}s` : "ضبط صدا"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 text-center">
                <label className="cursor-pointer block">
                  <div className="w-24 h-24 rounded-full bg-blue-500 shadow-lg mx-auto flex items-center justify-center hover:bg-blue-600">
                    <span className="text-white text-4xl">📁</span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-blue-800">آپلود فایل</p>
                  <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, "voice")} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {activeTab === "image" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 text-center">
                <label className="cursor-pointer block">
                  <div className="w-24 h-24 rounded-full bg-purple-500 shadow-lg mx-auto flex items-center justify-center">
                    <span className="text-white text-4xl">📷</span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-purple-800">گرفتن عکس</p>
                  <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileUpload(e, "image")} className="hidden" />
                </label>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 text-center">
                <label className="cursor-pointer block">
                  <div className="w-24 h-24 rounded-full bg-blue-500 shadow-lg mx-auto flex items-center justify-center">
                    <span className="text-white text-4xl">🖼️</span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-blue-800">آپلود تصویر</p>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "image")} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {activeTab === "long_text" && (
            <div className="space-y-3">
              <input
                type="text"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                placeholder="عنوان (اختیاری)"
                className="w-full p-3 border rounded-lg text-sm"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="متن بازخورد مشتری را وارد کنید..."
                className="w-full p-3 border rounded-lg text-sm min-h-[150px]"
                rows={6}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{text.length} کاراکتر</span>
                <button
                  onClick={analyzeText}
                  disabled={loading || !text.trim()}
                  className="px-6 py-2 bg-blueframe text-white rounded-lg font-bold disabled:opacity-50 text-sm"
                >
                  {loading ? "⏳ در حال تحلیل..." : "🚀 تحلیل متن"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-xl shadow border p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blueframe mx-auto mb-3"></div>
          <p className="text-gray-600">در حال تحلیل با AI...</p>
        </div>
      )}

      {result && !loading && (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="p-4 sm:p-5 bg-gradient-to-l from-blueframe/10 to-blue-50 border-b">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                  <span>{TYPE_CONFIG[result.type]?.icon}</span>
                  <span>{result.title}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">{formatTime(result.createdAt)}</p>
              </div>
              <div className={"px-3 py-1.5 rounded-full text-xs font-bold " + getSentimentColor(result.sentimentLabel)}>
                {getSentimentLabel(result.sentimentLabel)} ({result.sentiment.toFixed(2)})
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {result.originalText && (
              <div>
                <p className="text-xs font-bold text-gray-700 mb-1">📄 متن اصلی:</p>
                <div className="bg-gray-50 p-3 rounded-lg text-sm max-h-40 overflow-y-auto">{result.originalText}</div>
              </div>
            )}

            {result.summary && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs font-bold text-blue-900 mb-1">💡 خلاصه AI:</p>
                <p className="text-sm text-blue-800">{result.summary}</p>
              </div>
            )}

            {Object.keys(emotions).length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">🎭 احساسات:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(emotions).map(([emotion, value]) => {
                    const labels = { joy: "😊 شادی", anger: "😠 خشم", sadness: "😔 غم", trust: "🤝 اعتماد" };
                    const colors = { joy: "bg-yellow-500", anger: "bg-red-500", sadness: "bg-blue-500", trust: "bg-green-500" };
                    return (
                      <div key={emotion} className="bg-white border rounded-lg p-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium">{labels[emotion] || emotion}</span>
                          <span className="text-xs font-bold">{(value * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={"h-full " + (colors[emotion] || "bg-gray-500")} style={{ width: `${value * 100}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {metadata.keyPoints && metadata.keyPoints.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">🎯 نکات کلیدی:</p>
                <ul className="space-y-1">
                  {metadata.keyPoints.map((point, i) => (
                    <li key={i} className="text-sm flex items-start gap-2 bg-gray-50 p-2 rounded">
                      <span className="text-blueframe">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-bold text-sm">📜 تاریخچه ({history.length})</h3>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {history.map((item) => (
              <div key={item.id} className="p-3 hover:bg-gray-50 cursor-pointer" onClick={() => setResult(item)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="text-xl">{TYPE_CONFIG[item.type]?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{item.summary}</p>
                    </div>
                  </div>
                  <span className={"px-2 py-0.5 rounded-full text-xs whitespace-nowrap " + getSentimentColor(item.sentimentLabel)}>
                    {getSentimentLabel(item.sentimentLabel)}
                  </span>
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
