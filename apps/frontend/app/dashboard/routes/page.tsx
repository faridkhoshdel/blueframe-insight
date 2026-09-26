"use client";

import { useEffect, useState } from 'react';
import { Table, Form, Input, Select, DatePicker, Space, message, Typography, Row, Col, Button as AntButton } from 'antd';
import { PlusOutlined, EnvironmentOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { routesApi, distributorsApi, customersApi } from '@/lib/api';
import { GlassCard, GlassModal, GlassButton, GlassTag, PageWrapper } from '@/components/ui/GlassComponents';

const { Title } = Typography;

export default function RoutesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [distributors, setDistributors] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

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

      // افزودن stops
      if (values.stops && values.stops.length > 0) {
        for (let i = 0; i < values.stops.length; i++) {
          const stop = values.stops[i];
          await routesApi.addStop(routeId, {
            customerId: stop.customerId,
            order: i + 1,
            notes: stop.notes || '',
          });
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
    { title: 'نام مسیر', dataIndex: 'name', key: 'name', render: (n: string) => <b className="text-white">{n}</b> },
    {
      title: 'کد', dataIndex: 'code', key: 'code',
      render: (c: string) => c ? <GlassTag color="blue">{c}</GlassTag> : '-',
    },
    {
      title: 'توزیع‌کننده', dataIndex: 'distributor', key: 'dist',
      render: (d: any) => d?.name || '-',
    },
    {
      title: 'تعداد توقف', key: 'stops',
      render: (_: any, r: any) => <GlassTag color="success">{r.totalStops || 0} توقف</GlassTag>,
    },
    {
      title: 'تاریخ', dataIndex: 'scheduledDate', key: 'date',
      render: (d: string) => d ? new Date(d).toLocaleDateString('fa-IR') : '-',
    },
    {
      title: 'عملیات', key: 'actions',
      render: () => <GlassButton type="secondary" icon={<EnvironmentOutlined />} size="small">نقشه</GlassButton>,
    },
  ];

  return (
    <PageWrapper>
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={2} className="glass-title" style={{ margin: 0 }}>🗺️ مسیرها</Title>
            <p className="glass-subtitle text-sm mt-1">مدیریت مسیرهای توزیع</p>
          </div>
          <GlassButton icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            مسیر جدید
          </GlassButton>
        </div>

        <GlassCard className="glass-table">
          <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
        </GlassCard>

        <GlassModal
          open={modalOpen}
          onCancel={() => { setModalOpen(false); form.resetFields(); }}
          onOk={() => form.submit()}
          title="ایجاد مسیر جدید"
          width={800}
          confirmLoading={submitting}
          okText="ایجاد مسیر"
        >
          <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-4">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="name" label="نام مسیر" rules={[{ required: true, message: 'نام مسیر' }]}>
                  <Input className="glass-input" size="large" placeholder="مثلا: مسیر شمال تهران" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="code" label="کد مسیر" rules={[{ required: true, message: 'کد' }]}>
                  <Input className="glass-input" size="large" placeholder="مثلا: RTE-001" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="distributorId" label="توزیع‌کننده" rules={[{ required: true, message: 'توزیع‌کننده' }]}>
                  <Select className="glass-select" placeholder="انتخاب توزیع‌کننده..." size="large">
                    {distributors.map((d) => (
                      <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="scheduledDate" label="تاریخ برنامه‌ریزی">
                  <DatePicker className="glass-input w-full" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <div className="mb-3 flex items-center justify-between">
              <label className="text-white font-medium">توقف‌ها (مراجعه به مشتریان)</label>
            </div>

            <Form.List name="stops" initialValue={[{}]}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <div key={field.key} className="glass-card mb-3 p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-medium">توقف #{index + 1}</span>
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
                          className="glass-select"
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
                      <Form.Item
                        name={[field.name, 'notes']}
                        style={{ marginBottom: 0 }}
                      >
                        <Input className="glass-input" placeholder="یادداشت (اختیاری)..." />
                      </Form.Item>
                    </div>
                  ))}
                  <AntButton type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="glass-btn-secondary">
                    افزودن توقف جدید
                  </AntButton>
                </>
              )}
            </Form.List>
          </Form>
        </GlassModal>
      </div>
    </PageWrapper>
  );
}
