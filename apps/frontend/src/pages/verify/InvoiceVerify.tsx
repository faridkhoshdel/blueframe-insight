import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Typography, Descriptions, Table, Tag, Space, Input, Rate, message, Spin, Result } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, FilePdfOutlined } from '@ant-design/icons';
import { invoicesApi } from '../../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function InvoiceVerify() {
  const { token } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (!token) return;
    invoicesApi.getByToken(token)
      .then(r => setInvoice(r.data))
      .catch(() => setError('فاکتور یافت نشد یا لینک نامعتبر است'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleVerify = async (approved: boolean) => {
    try {
      await invoicesApi.verify(token!, { isApproved: approved, comment, rating });
      message.success(approved ? 'فاکتور تایید شد' : 'فاکتور رد شد');
      setInvoice({ ...invoice, status: approved ? 'VERIFIED' : 'CANCELLED' });
    } catch (e) {
      message.error('خطا در ثبت');
    }
  };

  const downloadPdf = async () => {
    try {
      const res = await invoicesApi.downloadPdf(invoice.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      a.click();
    } catch (e) {
      message.error('خطا در دانلود');
    }
  };

  if (loading) return <div style={{ padding: 100, textAlign: 'center' }}><Spin size="large" /></div>;
  if (error) return <Result status="error" title={error} />;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <Title level={2}>فاکتور {invoice.invoiceNumber}</Title>
          <Tag color="blue">{invoice.status}</Tag>
        </div>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="خریدار">{invoice.customer?.name}</Descriptions.Item>
          <Descriptions.Item label="تاریخ">{new Date(invoice.createdAt).toLocaleDateString('fa-IR')}</Descriptions.Item>
          <Descriptions.Item label="جمع کل">{new Intl.NumberFormat('fa-IR').format(invoice.subtotal)} ریال</Descriptions.Item>
          <Descriptions.Item label="مالیات">{new Intl.NumberFormat('fa-IR').format(invoice.tax)} ریال</Descriptions.Item>
          <Descriptions.Item label="تخفیف">{new Intl.NumberFormat('fa-IR').format(invoice.discount)} ریال</Descriptions.Item>
          <Descriptions.Item label="مبلغ نهایی">
            <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
              {new Intl.NumberFormat('fa-IR').format(invoice.total)} ریال
            </Text>
          </Descriptions.Item>
        </Descriptions>

        <Title level={4} style={{ marginTop: 24 }}>اقلام</Title>
        <Table
          dataSource={invoice.items}
          rowKey="id"
          pagination={false}
          columns={[
            { title: 'محصول', dataIndex: ['product', 'name'] },
            { title: 'تعداد', dataIndex: 'quantity' },
            { title: 'قیمت واحد', dataIndex: 'unitPrice', render: (p: number) => new Intl.NumberFormat('fa-IR').format(p) },
            { title: 'جمع', dataIndex: 'total', render: (t: number) => <b>{new Intl.NumberFormat('fa-IR').format(t)}</b> },
          ]}
        />

        {!invoice.verifiedAt && (
          <Card style={{ marginTop: 24, background: '#fafafa' }}>
            <Title level={4}>نظر شما</Title>
            <TextArea rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="نظر خود را بنویسید..." />
            <div style={{ marginTop: 16 }}>
              <Text>امتیاز: </Text>
              <Rate value={rating} onChange={setRating} />
            </div>
            <Space style={{ marginTop: 16 }}>
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleVerify(true)}>تایید فاکتور</Button>
              <Button danger icon={<CloseCircleOutlined />} onClick={() => handleVerify(false)}>رد فاکتور</Button>
              <Button icon={<FilePdfOutlined />} onClick={downloadPdf}>دانلود PDF</Button>
            </Space>
          </Card>
        )}

        {invoice.verifiedAt && (
          <Result
            status={invoice.status === 'VERIFIED' ? 'success' : 'warning'}
            title={invoice.status === 'VERIFIED' ? 'فاکتور تایید شده' : 'فاکتور رد شده'}
            subTitle={`تاریخ: ${new Date(invoice.verifiedAt).toLocaleDateString('fa-IR')}`}
          />
        )}
      </Card>
    </div>
  );
}
