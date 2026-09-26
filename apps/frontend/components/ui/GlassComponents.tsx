"use client";

import React from 'react';
import { Modal, Card, Button, Input, Select } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

export function GlassCard({ 
  children, 
  className = "", 
  title, 
  extra,
  style = {}
}: { 
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`glass-card ${className}`} style={style}>
      {(title || extra) && (
        <div className="flex items-center justify-between mb-4">
          {title && <div className="glass-title text-lg">{title}</div>}
          {extra && <div>{extra}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function GlassModal({
  open,
  onCancel,
  onOk,
  title,
  children,
  width = 600,
  okText = "ذخیره",
  cancelText = "انصراف",
  confirmLoading = false,
  footer = undefined,
}: {
  open: boolean;
  onCancel: () => void;
  onOk?: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  width?: number;
  okText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      title={title}
      width={width}
      confirmLoading={confirmLoading}
      className="glass-modal"
      wrapClassName="glass-modal-overlay"
      centered
      footer={footer === undefined ? (
        <div className="flex gap-3 justify-end">
          <Button className="glass-btn-secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button className="glass-btn-primary" onClick={onOk} loading={confirmLoading}>
            {okText}
          </Button>
        </div>
      ) : footer}
    >
      <div className="glass-form">{children}</div>
    </Modal>
  );
}

export function GlassButton({
  children,
  onClick,
  type = "primary",
  icon,
  className = "",
  loading = false,
  size = "middle",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "primary" | "secondary";
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
  size?: "small" | "middle" | "large";
}) {
  return (
    <Button
      className={type === "primary" ? `glass-btn-primary ${className}` : `glass-btn-secondary ${className}`}
      onClick={onClick}
      icon={icon}
      loading={loading}
      size={size}
    >
      {children}
    </Button>
  );
}

export function GlassTag({
  children,
  color = "default",
}: {
  children: React.ReactNode;
  color?: "default" | "success" | "blue" | "warning";
}) {
  const colorClass = {
    default: "glass-tag",
    success: "glass-tag glass-tag-success",
    blue: "glass-tag glass-tag-blue",
    warning: "glass-tag glass-tag-warning",
  }[color];
  return <span className={colorClass} style={{ padding: '2px 10px', display: 'inline-block' }}>{children}</span>;
}

export function FloatingOrbs() {
  return (
    <>
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />
    </>
  );
}

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-background relative">
      <FloatingOrbs />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
