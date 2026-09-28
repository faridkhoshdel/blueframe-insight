"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { Table, Form, Input, message, Typography, Modal, Button as AntButton } from 'antd';
import { PlusOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { distributorsApi } from '@/lib/api';
import { useTheme } from '@/lib/ThemeContext';

const { Title } = Typography;
const { TextArea } = Input;

export default function DistributorsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const { theme } = useTheme();

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
    { title: 'نام', dataIndex: 'name', key: 'name', render: (n: string) => <b>{n}</b> },
    { title: 'شرکت', dataIndex: 'company', key: 'company', render: (c: string) => c || '-' },
    {
      title: 'تلفن', dataIndex: 'phone', key: 'phone',
      render: (p: string) => p ? <span style={{ color: 'var(--accent-color)' }}><PhoneOutlined /> {p}</span> : '-',
    },
    {
      title: 'ایمیل', dataIndex: 'email', key: 'email',
      render: (e: string) => e ? <span style={{ color: 'var(--accent-color)' }}><MailOutlined /> {e}</span> : '-',
    },
    {
      title: 'منطقه', dataIndex: 'territory', key: 'territory',
      render: (t: string) => t ? <span className="theme-tag theme-tag-blue">{t}</span> : '-',
    },
    {
      title: 'مسیرها', key: 'routes',
      render: (_: any, r: any) => <span className="theme-tag theme-tag-success">{r.routes?.length || 0} مسیر</span>,
    },
  ];

  return (
    <div className="relative">
      {theme === 'glass' && (
        <>
          <div className="glass-orb orb-blue" />
          <div className="glass-orb orb-cyan" />
        </>
      )}

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <Title level={2} className="theme-title" style={{ margin: 0 }}>🚚 توزیع‌کنندگان</Title>
            <p className="theme-subtitle text-sm mt-1">مدیریت شبکه توزیع</p>
          </div>
          <AntButton className="theme-btn-primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} size="large">
            توزیع‌کننده جدید
          </AntButton>
        </div>

        <div className="theme-card theme-table responsive-table">
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, responsive: true }}
            scroll={{ x: 800 }}
          />
        </div>

        <Modal
          open={modalOpen}
          onCancel={() => { setModalOpen(false); form.resetFields(); }}
          onOk={() => form.submit()}
          title="توزیع‌کننده جدید"
          width={600}
          confirmLoading={submitting}
          okText="ذخیره"
          cancelText="انصراف"
          className="theme-modal"
          centered
        >
          <Form form={form} layout="vertical" onFinish={handleCreate} className="theme-form mt-4">
            <Form.Item name="name" label="نام" rules={[{ required: true }]}>
              <Input className="theme-input" size="large" />
            </Form.Item>
            <Form.Item name="company" label="شرکت">
              <Input className="theme-input" size="large" />
            </Form.Item>
            <Form.Item name="phone" label="تلفن" rules={[{ required: true }]}>
              <Input className="theme-input" size="large" />
            </Form.Item>
            <Form.Item name="email" label="ایمیل">
              <Input className="theme-input" size="large" type="email" />
            </Form.Item>
            <Form.Item name="territory" label="منطقه">
              <Input className="theme-input" size="large" />
            </Form.Item>
            <Form.Item name="address" label="آدرس">
              <TextArea className="theme-input" rows={2} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
