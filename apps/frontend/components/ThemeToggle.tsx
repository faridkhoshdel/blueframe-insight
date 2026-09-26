"use client";

import { useState, useEffect } from "react";
import { Dropdown, MenuProps } from 'antd';
import { SunOutlined, MoonOutlined, CloudOutlined } from '@ant-design/icons';
import { useTheme, ThemeMode } from "@/lib/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const items: MenuProps['items'] = [
    {
      key: 'light',
      label: '☀️ روشن',
      icon: <SunOutlined />,
    },
    {
      key: 'dark',
      label: '🌙 تاریک',
      icon: <MoonOutlined />,
    },
    {
      key: 'glass',
      label: '💎 شیشه‌ای',
      icon: <CloudOutlined />,
    },
  ];

  const onClick: MenuProps['onClick'] = ({ key }) => {
    setTheme(key as ThemeMode);
  };

  const getIcon = () => {
    if (theme === 'dark') return <MoonOutlined />;
    if (theme === 'glass') return <CloudOutlined />;
    return <SunOutlined />;
  };

  return (
    <Dropdown menu={{ items, onClick, selectedKeys: [theme] }} placement="bottomRight">
      <button
        className="p-2 rounded-lg transition-colors hover:bg-gray-100:bg-gray-700"
        style={{ 
          color: 'var(--text-primary, #1f2937)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
        }}
        title="تغییر تم"
      >
        {getIcon()}
      </button>
    </Dropdown>
  );
}
