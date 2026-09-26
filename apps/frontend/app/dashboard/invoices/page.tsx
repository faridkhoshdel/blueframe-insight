"use client";

import { useEffect, useState } from 'react';
import { Table, Form, Input, InputNumber, Select, Space, message, Typography, Row, Col, Button as AntButton } from 'antd';
import { FilePdfOutlined, PlusOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { invoicesApi, customersApi, productsApi } from '@/lib/api';
import { GlassCard, GlassModal, GlassButton, GlassTag, PageWrapper } from '@/components/ui/GlassComponents';

const { Title } = Typography;
const { TextArea } = Input;

const STATUS_COLORS: any = {
  DRAFT: 'default', ISSUED: 'blue', SENT: 'blue',
  VERIFIED: 'success', PAID: 'success', CANCELLED: 'warning',
};

const STATUS_FA: any = {
  DRAFT: 'پیش‌نویس', ISSUED: 'صادر شده', SENT: 'ارسال شده',
  VERIFIED: 'تایید شده', PAID: 'پرداخت شده', CANCELLED: 'لغو شده',
};

export default function InvoicesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

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

  const loadCustomersAndProducts = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        customersApi.list(),
        productsApi.list(),
      ]);
      setCustomers(Array.isArray(custRes.data) ? custRes.data : []);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { 
    loadData(); 
    loadCustomersAndProducts();
  }, []);

  const handleCreate = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = {
        customerId: values.customerId,
        tax: values.tax || 0,
        discount: values.discount || 0,
        notes: values.notes || '',
        items: values.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
        })),
      };
      await invoicesApi.create(payload);
      message.success('فاکتور با موفقیت ساخته شد');
      setModalOpen(false);
      form.resetFields();
      loadData();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'خطا در ایجاد فاکتور');
    }
    setSubmitting(false);
  };

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
    { 
      title: 'شماره', 
      dataIndex: 'invoiceNumber', 
      key: 'number',
      render: (n: string) => <span className="font-mono text-blue-300">{n}</span>
    },
    {
      title: 'خریدار', 
      dataIndex: 'customer', 
      key: 'cust',
      render: (c: any) => c?.name || '-',
    },
    {
      title: 'مبلغ', 
      dataIndex: 'total', 
      key: 'total',
      render: (t: number) => (
        <b className="text-green-300">
          {new Intl.NumberFormat('fa-IR').format(t || 0)} ریال
        </b>
      ),
    },
    {
      title: 'وضعیت', 
      dataIndex: 'status', 
      key: 'status',
      render: (s: string) => <GlassTag color={STATUS_COLORS[s] as any}>{STATUS_FA[s] || s}</GlassTag>,
    },
    {
      title: 'تاریخ', 
      dataIndex: 'createdAt', 
      key: 'date',
      render: (d: string) => d ? new Date(d).toLocaleDateString('fa-IR') : '-',
    },
    {
      title: 'عملیات', 
      key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          <GlassButton 
            type="secondary" 
            icon={<FilePdfOutlined />}
            onClick={() => downloadPdf(r.id, r.invoiceNumber)}
            size="small"
          >
            PDF
          </GlassButton>
        </Space>
      ),
    },
  ];

  return (
    <PageWrapper>
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={2} className="glass-title" style={{ margin: 0 }}>📋 فاکتورها</Title>
            <p className="glass-subtitle text-sm mt-1">مدیریت و صدور فاکتورهای فروش</p>
          </div>
          <GlassButton 
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            فاکتور جدید
          </GlassButton>
        </div>

        <GlassCard className="glass-table">
          <Table 
            columns={columns} 
            dataSource={data} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </GlassCard>

        <GlassModal
          open={modalOpen}
          onCancel={() => { setModalOpen(false); form.resetFields(); }}
          onOk={() => form.submit()}
          title="ایجاد فاکتور جدید"
          width={800}
          confirmLoading={submitting}
          okText="صدور فاکتور"
        >
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleCreate}
            className="mt-4"
          >
            <Form.Item 
              name="customerId" 
              label="خریدار" 
              rules={[{ required: true, message: 'لطفا خریدار را انتخاب کنید' }]}
            >
              <Select
                className="glass-select"
                placeholder="انتخاب خریدار..."
                showSearch
                optionFilterProp="children"
                size="large"
              >
                {customers.map((c) => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ''}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <div className="mb-3 flex items-center justify-between">
              <label className="text-white font-medium">اقلام فاکتور</label>
            </div>

            <Form.List name="items" initialValue={[{}]}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <div key={field.key} className="glass-card mb-3 p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-medium">قلم #{index + 1}</span>
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
                      <Row gutter={12}>
                        <Col span={24}>
                          <Form.Item
                            name={[field.name, 'productId']}
                            rules={[{ required: true, message: 'محصول را انتخاب کنید' }]}
                            style={{ marginBottom: 8 }}
                          >
                            <Select
                              className="glass-select"
                              placeholder="انتخاب محصول..."
                              showSearch
                              optionFilterProp="children"
                            >
                              {products.map((p) => (
                                <Select.Option key={p.id} value={p.id}>
                                  {p.name} {p.price ? `- ${new Intl.NumberFormat('fa-IR').format(p.price)} ریال` : ''}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name={[field.name, 'quantity']}
                            label="تعداد"
                            rules={[{ required: true, message: 'تعداد' }]}
                            style={{ marginBottom: 8 }}
                          >
                            <InputNumber className="glass-input w-full" min={1} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name={[field.name, 'unitPrice']}
                            label="قیمت واحد"
                            rules={[{ required: true, message: 'قیمت' }]}
                            style={{ marginBottom: 8 }}
                          >
                            <InputNumber className="glass-input w-full" min={0} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name={[field.name, 'discount']}
                            label="تخفیف"
                            style={{ marginBottom: 8 }}
                          >
                            <InputNumber className="glass-input w-full" min={0} defaultValue={0} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <AntButton 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                    className="glass-btn-secondary"
                  >
                    افزودن قلم جدید
                  </AntButton>
                </>
              )}
            </Form.List>

            <Row gutter={16} className="mt-4">
              <Col span={12}>
                <Form.Item name="tax" label="مالیات (ریال)">
                  <InputNumber className="glass-input w-full" min={0} defaultValue={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="discount" label="تخفیف کل (ریال)">
                  <InputNumber className="glass-input w-full" min={0} defaultValue={0} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="notes" label="توضیحات">
              <TextArea 
                className="glass-input" 
                rows={2} 
                placeholder="توضیحات اختیاری..."
              />
            </Form.Item>
          </Form>
        </GlassModal>
      </div>
    </PageWrapper>
  );
}
