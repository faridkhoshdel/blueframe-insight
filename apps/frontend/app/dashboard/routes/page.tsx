"use client";

import { useEffect, useState } from 'react';
import { Table, Button, Card, Tag, Typography, message } from 'antd';
import { PlusOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { routesApi } from '@/lib/api';

const { Title } = Typography;

export default function RoutesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await routesApi.list();
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      message.error('خطا در دریافت');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const columns = [
    { title: 'نام مسیر', dataIndex: 'name', key: 'name' },
    {
      title: 'کد', dataIndex: 'code', key: 'code',
      render: (c: string) => c ? <Tag>{c}</Tag> : '-',
    },
    {
      title: 'توزیع‌کننده', dataIndex: 'distributor', key: 'dist',
      render: (d: any) => d?.name || '-',
    },
    {
      title: 'تعداد توقف', dataIndex: 'totalStops', key: 'stops',
      render: (n: number) => <Tag color="green">{n || 0}</Tag>,
    },
    {
      title: 'تاریخ', dataIndex: 'scheduledDate', key: 'date',
      render: (d: string) => d ? new Date(d).toLocaleDateString('fa-IR') : '-',
    },
    {
      title: 'عملیات', key: 'actions',
      render: () => <Button icon={<EnvironmentOutlined />} size="small">نقشه</Button>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>🗺️ مسیرها</Title>
        <Button type="primary" icon={<PlusOutlined />}>مسیر جدید</Button>
      </div>
      <Card>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
      </Card>
    </div>
  );
}
