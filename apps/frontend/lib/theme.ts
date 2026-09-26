"use client";

export type ThemeMode = "light" | "dark" | "glass";

// ============ توابع قدیمی (برای backward compatibility) ============
export function applyTheme(theme: 'light' | 'dark' | 'glass') {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('blueframe_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function initTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('blueframe_theme') as ThemeMode;
  if (saved && ['light', 'dark', 'glass'].includes(saved)) {
    document.documentElement.setAttribute('data-theme', saved);
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    }
    return saved;
  }
  document.documentElement.setAttribute('data-theme', 'light');
  return 'light';
}

export function getTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('blueframe_theme') as ThemeMode;
  if (saved && ['light', 'dark', 'glass'].includes(saved)) {
    return saved;
  }
  return 'light';
}
