"use client";

import { Typography, Button, message } from 'antd';
import { CheckOutlined, ReloadOutlined, SunOutlined, MoonOutlined, CloudOutlined } from '@ant-design/icons';
import { COLOR_PALETTES, useColorTheme } from '@/lib/ColorThemeContext';
import { useTheme, ThemeMode } from '@/lib/ThemeContext';

const { Title } = Typography;

export default function AppearancePage() {
  const { palette, setPalette, setCustomColor, reset } = useColorTheme();
  const { theme, setTheme } = useTheme();

  const themes: { id: ThemeMode; name: string; icon: any; desc: string }[] = [
    { id: 'light', name: 'روشن', icon: <SunOutlined />, desc: 'پس‌زمینه سفید، متن تیره' },
    { id: 'dark', name: 'تاریک', icon: <MoonOutlined />, desc: 'پس‌زمینه تیره، متن روشن' },
    { id: 'glass', name: 'شیشه‌ای', icon: <CloudOutlined />, desc: 'سفید مات با افکت شیشه' },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Title level={2} className="theme-title" style={{ margin: 0 }}>🎨 ظاهر و شخصی‌سازی</Title>
      <p className="theme-subtitle text-sm mt-1 mb-6">تم و رنگ‌بندی برنامه را مطابق سلیقه خود تنظیم کنید</p>

      {/* ===== بخش تم ===== */}
      <div className="theme-card mb-6">
        <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>حالت نمایش</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className="p-4 rounded-xl border-2 transition-all text-right"
              style={{
                borderColor: theme === t.id ? 'var(--accent-color)' : 'var(--border-color)',
                background: theme === t.id ? 'var(--bg-hover)' : 'var(--bg-secondary)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: 'var(--accent-color)', fontSize: 18 }}>{t.icon}</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{t.name}</span>
                {theme === t.id && <CheckOutlined style={{ color: 'var(--accent-color)', marginRight: 'auto' }} />}
              </div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ===== بخش پالت رنگی ===== */}
      <div className="theme-card mb-6">
        <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>پالت رنگی</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {COLOR_PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPalette(p)}
              className="p-3 rounded-xl border-2 transition-all"
              style={{
                borderColor: palette.id === p.id ? p.primary : 'var(--border-color)',
                background: 'var(--bg-secondary)',
              }}
            >
              <div
                className="h-10 rounded-lg mb-2"
                style={{ background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})` }}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {p.emoji} {p.nameFa}
                </span>
                {palette.id === p.id && <CheckOutlined style={{ color: p.primary }} />}
              </div>
            </button>
          ))}
        </div>

        {/* رنگ سفارشی */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-hover)' }}>
          <div>
            <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>🎨 رنگ سفارشی</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>هر رنگی که دوست دارید انتخاب کنید</p>
          </div>
          <input
            type="color"
            defaultValue={palette.primary}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-16 h-10 rounded-lg cursor-pointer border-0"
            style={{ background: 'transparent' }}
          />
          <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>{palette.primary}</span>
        </div>
      </div>

      {/* ===== پیش‌نمایش ===== */}
      <div className="theme-card mb-6">
        <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>پیش‌نمایش زنده</h3>
        <div className="flex flex-wrap gap-3 items-center">
          <Button className="theme-btn-primary">دکمه اصلی</Button>
          <Button className="theme-btn-secondary">دکمه ثانویه</Button>
          <span className="theme-tag theme-tag-blue">برچسب آبی</span>
          <span className="theme-tag theme-tag-success">برچسب سبز</span>
          <span className="theme-tag theme-tag-warning">برچسب هشدار</span>
        </div>
        <div className="mt-4 p-4 rounded-xl grad-card grad-blue">
          <p className="font-bold mb-1">کارت نمونه</p>
          <p className="text-sm">این یک کارت با رنگ فعلی شماست</p>
        </div>
      </div>

      {/* ===== بازنشانی ===== */}
      <Button className="theme-btn-secondary" icon={<ReloadOutlined />} onClick={() => { reset(); setTheme('light'); message.success('به حالت پیش‌فرض بازگشت'); }}>
        بازنشانی به پیش‌فرض
      </Button>
    </div>
  );
}
