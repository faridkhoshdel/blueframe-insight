"use client";

import { useEffect, useState } from 'react';
import { Table, Button, Card, Tag, Typography, message, Space } from 'antd';
import { FilePdfOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { invoicesApi } from '@/lib/api';

const { Title } = Typography;

const STATUS_COLORS: any = {
  DRAFT: 'default', ISSUED: 'blue', SENT: 'cyan',
  VERIFIED: 'green', PAID: 'purple', CANCELLED: 'red',
};

const STATUS_FA: any = {
  DRAFT: 'پیش‌نویس', ISSUED: 'صادر شده', SENT: 'ارسال شده',
  VERIFIED: 'تایید شده', PAID: 'پرداخت شده', CANCELLED: 'لغو شده',
};

export default function InvoicesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await invoicesApi.list();
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      message.error('خطا در دریافت');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const downloadPdf = async (id: string, number: string) => {
    try {
      const res = await invoicesApi.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${number}.pdf`;
      a.click();
      message.success('PDF دانلود شد');
    } catch (e) {
      message.error('خطا در دانلود PDF');
    }
  };

  const columns = [
    { title: 'شماره', dataIndex: 'invoiceNumber', key: 'number' },
    {
      title: 'خریدار', dataIndex: 'customer', key: 'cust',
      render: (c: any) => c?.name || '-',
    },
    {
      title: 'مبلغ', dataIndex: 'total', key: 'total',
      render: (t: number) => <b>{new Intl.NumberFormat('fa-IR').format(t || 0)} ریال</b>,
    },
    {
      title: 'وضعیت', dataIndex: 'status', key: 'status',
      render: (s: string) => <Tag color={STATUS_COLORS[s]}>{STATUS_FA[s] || s}</Tag>,
    },
    {
      title: 'تاریخ', dataIndex: 'createdAt', key: 'date',
      render: (d: string) => d ? new Date(d).toLocaleDateString('fa-IR') : '-',
    },
    {
      title: 'عملیات', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>مشاهده</Button>
          <Button
            size="small"
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={() => downloadPdf(r.id, r.invoiceNumber)}
          >
            PDF
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>📋 فاکتورها</Title>
        <Button type="primary" icon={<PlusOutlined />}>فاکتور جدید</Button>
      </div>
      <Card>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
      </Card>
    </div>
  );
}
