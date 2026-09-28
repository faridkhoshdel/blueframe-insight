"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Typography, Button, Spin, Descriptions, Tag, Result, Table } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { routesApi } from "@/lib/api";
import RouteMap from "@/components/maps/RouteMap";

const { Title } = Typography;

export default function RouteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    routesApi.get(id)
      .then((r) => setRoute(r.data))
      .catch(() => setError("مسیر یافت نشد"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center"><Spin size="large" /></div>;
  if (error) return <Result status="error" title={error} />;
  if (!route) return null;

  const stops = (route.stops || []).map((s: any, i: number) => ({
    id: s.id || String(i),
    name: s.customer?.name || `توقف ${s.order}`,
    lat: s.customer?.lat ?? (35.6892 + (Math.random() - 0.5) * 0.1),
    lng: s.customer?.lng ?? (51.389 + (Math.random() - 0.5) * 0.1),
    order: s.order || i + 1,
    notes: s.notes,
  }));

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Button className="theme-btn-secondary" icon={<ArrowRightOutlined />} onClick={() => router.push("/dashboard/routes")}>
          بازگشت
        </Button>
        <div>
          <Title level={3} className="theme-title" style={{ margin: 0 }}>{route.name}</Title>
          <p className="theme-subtitle text-sm mt-1">کد: {route.code} • {route.distributor?.name || "-"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RouteMap stops={stops} routeName={route.name} />
        </div>

        <div className="space-y-4">
          <div className="theme-card">
            <h4 className="font-bold mb-3" style={{ color: "var(--text-primary)" }}>📋 اطلاعات مسیر</h4>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="تاریخ">{route.scheduledDate ? new Date(route.scheduledDate).toLocaleDateString("fa-IR") : "-"}</Descriptions.Item>
              <Descriptions.Item label="توزیع‌کننده">{route.distributor?.name || "-"}</Descriptions.Item>
              <Descriptions.Item label="تعداد توقف"><Tag color="blue">{stops.length}</Tag></Descriptions.Item>
            </Descriptions>
          </div>

          <div className="theme-card">
            <h4 className="font-bold mb-3" style={{ color: "var(--text-primary)" }}>📍 توقف‌ها</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {stops.map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "var(--bg-hover)" }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: "var(--accent-color)" }}
                  >
                    {s.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{s.name}</div>
                    {s.notes && <div className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{s.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
