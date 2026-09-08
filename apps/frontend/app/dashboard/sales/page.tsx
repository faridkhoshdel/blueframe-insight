"use client";
import { useState, useEffect } from "react";
import { API_URL } from '@/lib/api';
const STAGES = [
  { key: "LEAD", name: "Lead اولیه", color: "bg-gray-100 border-gray-300" },
  { key: "CONTACTED", name: "تماس گرفته", color: "bg-blue-50 border-blue-300" },
  { key: "PROPOSAL", name: "پروپوزال", color: "bg-yellow-50 border-yellow-300" },
  { key: "NEGOTIATION", name: "مذاکره", color: "bg-purple-50 border-purple-300" },
  { key: "WON", name: "برنده ✓", color: "bg-green-50 border-green-300" },
  { key: "LOST", name: "از دست رفته ✗", color: "bg-red-50 border-red-300" },
];

export default function SalesPage() {
  const [groupedDeals, setGroupedDeals] = useState<any>({});
  const [stats, setStats] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newDeal, setNewDeal] = useState({ title: "", customerId: "", value: 0 });

  const loadData = async () => {
    const [dRes, sRes, cRes] = await Promise.all([
      fetch(`${API_URL}/crm/deals/grouped`),
      fetch(`${API_URL}/crm/pipeline/stats`),
      fetch(`${API_URL}/crm/customers`),
    ]);
    setGroupedDeals(await dRes.json());
    setStats(await sRes.json());
    setCustomers(await cRes.json());
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateDeal = async () => {
    await fetch(`${API_URL}/crm/deals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDeal),
    });
    setShowForm(false);
    setNewDeal({ title: "", customerId: "", value: 0 });
    loadData();
  };

  const moveDeal = async (dealId: string, newStage: string) => {
    await fetch(`${API_URL}/crm/deals/${dealId}/stage`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    loadData();
  };

  const formatPrice = (n: number) => new Intl.NumberFormat("fa-IR").format(n);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blueframe">فروش و CRM</h1>
          <p className="text-gray-600 mt-1">Kanban pipeline و مدیریت مشتریان</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-6 py-2.5 bg-blueframe text-white rounded-lg shadow-soft">
          + معامله جدید
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-soft border">
            <p className="text-sm text-gray-500">مشتریان</p>
            <p className="text-2xl font-bold text-blueframe">{stats.totalCustomers}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-soft border">
            <p className="text-sm text-gray-500">معاملات فعال</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.activeDeals}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-soft border">
            <p className="text-sm text-gray-500">ارزش Pipeline</p>
            <p className="text-2xl font-bold text-green-600">{formatPrice(stats.pipelineValue)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-soft border">
            <p className="text-sm text-gray-500">نرخ برد</p>
            <p className="text-2xl font-bold text-purple-600">{stats.winRate}%</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-soft border space-y-4">
          <h3 className="text-lg font-bold">معامله جدید</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <input placeholder="عنوان معامله" value={newDeal.title}
              onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
              className="p-3 border rounded-lg" />
            <select value={newDeal.customerId}
              onChange={(e) => setNewDeal({ ...newDeal, customerId: e.target.value })}
              className="p-3 border rounded-lg">
              <option value="">انتخاب مشتری</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="number" placeholder="ارزش (تومان)" value={newDeal.value}
              onChange={(e) => setNewDeal({ ...newDeal, value: Number(e.target.value) })}
              className="p-3 border rounded-lg" />
          </div>
          <button onClick={handleCreateDeal} className="px-6 py-2 bg-green-600 text-white rounded-lg">ایجاد معامله</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAGES.map(stage => (
          <div key={stage.key} className={`rounded-xl p-3 border-2 ${stage.color} min-h-[400px]`}>
            <h3 className="font-bold text-sm mb-3 text-center">{stage.name}</h3>
            <div className="space-y-2">
              {(groupedDeals[stage.key] || []).map((deal: any) => (
                <div key={deal.id} className="bg-white p-3 rounded-lg shadow-sm border">
                  <p className="font-bold text-sm mb-1">{deal.title}</p>
                  <p className="text-xs text-gray-600 mb-2">{deal.customer?.name}</p>
                  <p className="text-xs font-bold text-blueframe mb-2">{formatPrice(deal.value)} ﷼</p>
                  {stage.key !== "WON" && stage.key !== "LOST" && (
                    <select onChange={(e) => moveDeal(deal.id, e.target.value)}
                      className="w-full text-xs p-1 border rounded" defaultValue="">
                      <option value="" disabled>انتقال به...</option>
                      {STAGES.filter(s => s.key !== stage.key).map(s => (
                        <option key={s.key} value={s.key}>{s.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
              {(!groupedDeals[stage.key] || groupedDeals[stage.key].length === 0) && (
                <p className="text-center text-xs text-gray-500 py-8">خالی</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
