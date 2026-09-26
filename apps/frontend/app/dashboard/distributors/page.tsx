"use client";

import { useEffect, useState } from 'react';
import { Table, Form, Input, message, Typography } from 'antd';
import { PlusOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { distributorsApi } from '@/lib/api';
import { GlassCard, GlassModal, GlassButton, GlassTag, PageWrapper } from '@/components/ui/GlassComponents';

const { Title } = Typography;
const { TextArea } = Input;

export default function DistributorsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await distributorsApi.list();
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      message.error('خطا در دریافت اطلاعات');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (values: any) => {
    setSubmitting(true);
    try {
      await distributorsApi.create(values);
      message.success('توزیع‌کننده اضافه شد');
      setModalOpen(false);
      form.resetFields();
      loadData();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'خطا در ایجاد');
    }
    setSubmitting(false);
  };

  const columns = [
    { title: 'نام', dataIndex: 'name', key: 'name', render: (n: string) => <b className="text-white">{n}</b> },
    { title: 'شرکت', dataIndex: 'company', key: 'company', render: (c: string) => c || '-' },
    {
      title: 'تلفن', dataIndex: 'phone', key: 'phone',
      render: (p: string) => p ? <span className="text-blue-300"><PhoneOutlined /> {p}</span> : '-',
    },
    {
      title: 'ایمیل', dataIndex: 'email', key: 'email',
      render: (e: string) => e ? <span className="text-blue-300"><MailOutlined /> {e}</span> : '-',
    },
    {
      title: 'منطقه', dataIndex: 'territory', key: 'territory',
      render: (t: string) => t ? <GlassTag color="blue">{t}</GlassTag> : '-',
    },
    {
      title: 'مسیرها', key: 'routes',
      render: (_: any, r: any) => <GlassTag color="success">{r.routes?.length || 0} مسیر</GlassTag>,
    },
  ];

  return (
    <PageWrapper>
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={2} className="glass-title" style={{ margin: 0 }}>🚚 توزیع‌کنندگان</Title>
            <p className="glass-subtitle text-sm mt-1">مدیریت شبکه توزیع</p>
          </div>
          <GlassButton icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            توزیع‌کننده جدید
          </GlassButton>
        </div>

        <GlassCard className="glass-table">
          <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
        </GlassCard>

        <GlassModal
          open={modalOpen}
          onCancel={() => { setModalOpen(false); form.resetFields(); }}
          onOk={() => form.submit()}
          title="توزیع‌کننده جدید"
          width={600}
          confirmLoading={submitting}
        >
          <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-4">
            <Form.Item name="name" label="نام" rules={[{ required: true }]}>
              <Input className="glass-input" size="large" />
            </Form.Item>
            <Form.Item name="company" label="شرکت">
              <Input className="glass-input" size="large" />
            </Form.Item>
            <Form.Item name="phone" label="تلفن" rules={[{ required: true }]}>
              <Input className="glass-input" size="large" />
            </Form.Item>
            <Form.Item name="email" label="ایمیل">
              <Input className="glass-input" size="large" type="email" />
            </Form.Item>
            <Form.Item name="territory" label="منطقه">
              <Input className="glass-input" size="large" />
            </Form.Item>
            <Form.Item name="address" label="آدرس">
              <TextArea className="glass-input" rows={2} />
            </Form.Item>
          </Form>
        </GlassModal>
      </div>
    </PageWrapper>
  );
}
