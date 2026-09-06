"use client";
import { useInstallPrompt } from "@/lib/pwa";
import { useState } from "react";

export default function InstallBanner() {
  const { installPrompt, isInstalled, isIOS, promptInstall } = useInstallPrompt();
  const [showBanner, setShowBanner] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (isInstalled || !showBanner) return null;

  const handleInstall = async () => {
    setInstalling(true);
    const success = await promptInstall();
    setInstalling(false);
    
    if (!success) {
      // Show manual instructions if prompt not available
      setShowHelp(true);
    }
  };

  // Show banner only if we have install prompt OR show help button
  if (!installPrompt && !showHelp) return null;

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-gradient-to-l from-blueframe to-blue-600 text-white rounded-2xl shadow-2xl p-4 z-[100] animate-slide-up">
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0">📲</div>
          <div className="flex-1">
            <h3 className="font-bold text-sm">نصب blueFrame روی گوشی</h3>
            <p className="text-xs text-blue-100 mt-0.5">دسترسی سریع + کار آفلاین + نوتیفیکیشن</p>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={handleInstall} 
                disabled={installing}
                className="px-3 py-1.5 bg-white text-blueframe rounded-lg text-xs font-bold hover:bg-blue-50 disabled:opacity-50"
              >
                {installing ? "⏳ در حال نصب..." : "📥 نصب اپ"}
              </button>
              <button 
                onClick={() => setShowHelp(true)} 
                className="px-3 py-1.5 bg-blue-500/30 rounded-lg text-xs hover:bg-blue-500/50"
              >
                راهنما
              </button>
              <button 
                onClick={() => setShowBanner(false)} 
                className="px-3 py-1.5 bg-blue-500/30 rounded-lg text-xs hover:bg-blue-500/50"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for manual install instructions */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">📲 راهنمای نصب</h3>
            
            {isIOS ? (
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p>۱. روی دکمه <strong>اشتراک‌گذاری</strong> (مربع با فلش بالا) در نوار پایین سافاری کلیک کنید</p>
                <p>۲. گزینه <strong>"Add to Home Screen"</strong> را انتخاب کنید</p>
                <p>۳. روی <strong>"Add"</strong> کلیک کنید</p>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p>۱. روی منوی <strong>⋮</strong> (سه نقطه) در گوشه بالا کلیک کنید</p>
                <p>۲. گزینه <strong>"افزودن به صفحه اصلی"</strong> یا <strong>"نصب برنامه"</strong> را انتخاب کنید</p>
                <p>۳. روی <strong>"نصب"</strong> کلیک کنید</p>
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-xs">
                  <p className="font-bold text-yellow-800 dark:text-yellow-300 mb-1">💡 نکته:</p>
                  <p className="text-yellow-700 dark:text-yellow-400">
                    اگر گزینه نصب را نمی‌بینید، مطمئن شوید که صفحه را از آدرس <code>localhost:50002</code> باز کرده‌اید و از مرورگر <strong>Chrome</strong> استفاده می‌کنید.
                  </p>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setShowHelp(false)} 
              className="mt-5 w-full py-2 bg-blueframe text-white rounded-lg font-bold"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </>
  );
}
