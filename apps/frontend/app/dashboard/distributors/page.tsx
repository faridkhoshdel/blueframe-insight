"use client";

import { useEffect, useState } from 'react';
import { Table, Button, Card, Tag, Modal, Form, Input, message, Typography } from 'antd';
import { PlusOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { distributorsApi } from '@/lib/api';

const { Title } = Typography;

export default function DistributorsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
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
    try {
      await distributorsApi.create(values);
      message.success('توزیع‌کننده اضافه شد');
      setModalOpen(false);
      form.resetFields();
      loadData();
    } catch (e) {
      message.error('خطا در ایجاد');
    }
  };

  const columns = [
    { title: 'نام', dataIndex: 'name', key: 'name' },
    { title: 'شرکت', dataIndex: 'company', key: 'company' },
    {
      title: 'تلفن', dataIndex: 'phone', key: 'phone',
      render: (p: string) => p ? <span><PhoneOutlined /> {p}</span> : '-',
    },
    {
      title: 'ایمیل', dataIndex: 'email', key: 'email',
      render: (e: string) => e ? <span><MailOutlined /> {e}</span> : '-',
    },
    {
      title: 'منطقه', dataIndex: 'territory', key: 'territory',
      render: (t: string) => t ? <Tag>{t}</Tag> : '-',
    },
    {
      title: 'مسیرها', key: 'routes',
      render: (_: any, r: any) => <Tag color="blue">{r.routes?.length || 0} مسیر</Tag>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>🚚 توزیع‌کنندگان</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          توزیع‌کننده جدید
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
      </Card>

      <Modal
        title="توزیع‌کننده جدید"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="ذخیره"
        cancelText="انصراف"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="نام" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="company" label="شرکت">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="تلفن" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="ایمیل">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="territory" label="منطقه">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="آدرس">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
