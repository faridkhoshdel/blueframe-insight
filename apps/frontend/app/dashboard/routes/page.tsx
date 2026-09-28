"use client";
import { useRouter } from "next/navigation";

import { useEffect, useState } from 'react';
import { Table, Form, Input, Select, DatePicker, Space, message, Typography, Row, Col, Button as AntButton, Modal } from 'antd';
import { PlusOutlined, EnvironmentOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { routesApi, distributorsApi, customersApi } from '@/lib/api';
import { useTheme } from '@/lib/ThemeContext';

const { Title } = Typography;

export default function RoutesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [distributors, setDistributors] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const { theme } = useTheme();
  const router = useRouter();

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

  const loadRelations = async () => {
    try {
      const [distRes, custRes] = await Promise.all([
        distributorsApi.list(),
        customersApi.list(),
      ]);
      setDistributors(Array.isArray(distRes.data) ? distRes.data : []);
      setCustomers(Array.isArray(custRes.data) ? custRes.data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    loadRelations();
  }, []);

  const handleCreate = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        code: values.code,
        distributorId: values.distributorId,
        scheduledDate: values.scheduledDate ? values.scheduledDate.toISOString() : null,
        notes: values.notes || '',
      };
      const routeRes = await routesApi.create(payload);
      const routeId = routeRes.data.id;

      if (values.stops && values.stops.length > 0) {
        for (let i = 0; i < values.stops.length; i++) {
          const stop = values.stops[i];
          if (stop.customerId) {
            await routesApi.addStop(routeId, {
              customerId: stop.customerId,
              order: i + 1,
              notes: stop.notes || '',
            });
          }
        }
      }

      message.success('مسیر با موفقیت ساخته شد');
      setModalOpen(false);
      form.resetFields();
      loadData();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'خطا در ایجاد مسیر');
    }
    setSubmitting(false);
  };

  const columns = [
    { title: 'نام مسیر', dataIndex: 'name', key: 'name', render: (n: string) => <b>{n}</b> },
    {
      title: 'کد', dataIndex: 'code', key: 'code',
      render: (c: string) => c ? <span className="theme-tag theme-tag-blue">{c}</span> : '-',
    },
    {
      title: 'توزیع‌کننده', dataIndex: 'distributor', key: 'dist',
      render: (d: any) => d?.name || '-',
    },
    {
      title: 'تعداد توقف', key: 'stops',
      render: (_: any, r: any) => <span className="theme-tag theme-tag-success">{r.totalStops || 0} توقف</span>,
    },
    {
      title: 'تاریخ', dataIndex: 'scheduledDate', key: 'date',
      render: (d: string) => d ? new Date(d).toLocaleDateString('fa-IR') : '-',
    },
    {
      title: 'عملیات', key: 'actions',
      render: (_: any, r: any) => (
        <AntButton className="theme-btn-secondary" icon={<EnvironmentOutlined />} size="small" onClick={() => router.push(`/dashboard/routes/${r.id}`)}>
          نقشه
        </AntButton>
      ),
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
            <Title level={2} className="theme-title" style={{ margin: 0 }}>🗺️ مسیرها</Title>
            <p className="theme-subtitle text-sm mt-1">مدیریت مسیرهای توزیع</p>
          </div>
          <AntButton className="theme-btn-primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} size="large">
            مسیر جدید
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
          title="ایجاد مسیر جدید"
          width={800}
          confirmLoading={submitting}
          okText="ایجاد مسیر"
          cancelText="انصراف"
          className="theme-modal"
          centered
        >
          <Form form={form} layout="vertical" onFinish={handleCreate} className="theme-form mt-4">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="name" label="نام مسیر" rules={[{ required: true, message: 'نام مسیر' }]}>
                  <Input className="theme-input" size="large" placeholder="مثلا: مسیر شمال تهران" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="code" label="کد مسیر" rules={[{ required: true, message: 'کد' }]}>
                  <Input className="theme-input" size="large" placeholder="مثلا: RTE-001" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="distributorId" label="توزیع‌کننده" rules={[{ required: true, message: 'توزیع‌کننده' }]}>
                  <Select className="theme-select" placeholder="انتخاب توزیع‌کننده..." size="large">
                    {distributors.map((d) => (
                      <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="scheduledDate" label="تاریخ برنامه‌ریزی">
                  <DatePicker className="theme-input w-full" size="large" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <div className="mb-3">
              <label className="font-medium" style={{ color: 'var(--text-primary)' }}>توقف‌ها (مراجعه به مشتریان)</label>
            </div>

            <Form.List name="stops" initialValue={[{}]}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <div key={field.key} className="theme-card mb-3" style={{ padding: '16px', background: 'var(--bg-hover)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>توقف #{index + 1}</span>
                        {fields.length > 1 && (
                          <AntButton
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(field.name)}
                            size="small"
                          />
                        )}
                      </div>
                      <Form.Item
                        name={[field.name, 'customerId']}
                        rules={[{ required: true, message: 'مشتری' }]}
                        style={{ marginBottom: 8 }}
                      >
                        <Select
                          className="theme-select"
                          placeholder="انتخاب مشتری..."
                          showSearch
                          optionFilterProp="children"
                        >
                          {customers.map((c) => (
                            <Select.Option key={c.id} value={c.id}>
                              {c.name} {c.phone ? `(${c.phone})` : ''}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item name={[field.name, 'notes']} style={{ marginBottom: 0 }}>
                        <Input className="theme-input" placeholder="یادداشت (اختیاری)..." />
                      </Form.Item>
                    </div>
                  ))}
                  <AntButton type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="theme-btn-secondary">
                    افزودن توقف جدید
                  </AntButton>
                </>
              )}
            </Form.List>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
