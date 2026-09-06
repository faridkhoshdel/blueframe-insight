export default function DashboardPage() {
  const stats = [
    { title: "مجموع بازخوردهای مشتریان", value: "۱۲,۴۵۰", change: "+۱۲٪", color: "text-blueframe" },
    { title: "میانگین امتیاز احساسات (NPS)", value: "۷۸/۱۰۰", change: "+۵٪", color: "text-sentiment-positive" },
    { title: "محصولات فعال در انبار", value: "۳,۲۱۰", change: "پایدار", color: "text-gray-700" },
    { title: "سفارشات در انتظار توزیع", value: "۱۴۵", change: "-۲٪", color: "text-sentiment-negative" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">نمای کلی عملیات</h1>
        <p className="text-gray-500 mt-1">آخرین به‌روزرسانی: امروز، ۱۰:۳۰ صبح</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-soft border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">{stat.title}</p>
            <div className="flex items-end justify-between">
              <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.change.includes('+') ? 'bg-green-100 text-green-700' : stat.change.includes('-') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for AI Chart / Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-soft border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          <p className="mt-4 font-medium">نمودار روند احساسات مشتریان (به زودی با اتصال به API)</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">هشدارهای سیستم</h3>
          <div className="space-y-4">
            <div className="flex gap-3 items-start p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="w-2 h-2 mt-2 rounded-full bg-red-500 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-red-800">افت شدید احساسات در محصول X</p>
                <p className="text-xs text-red-600 mt-1">۱۵ نظر منفی در ۲ ساعت گذشته ثبت شد.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-yellow-800">موجودی انبار مرکزی رو به اتمام</p>
                <p className="text-xs text-yellow-700 mt-1">محصول "بسته Premium" کمتر از ۱۰ عدد است.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
