"use client";
import { API_URL } from '@/lib/api';

export function applyTheme(theme: 'light' | 'dark') {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    localStorage.setItem('blueframe_theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('blueframe_theme', 'light');
  }
}

export function initTheme() {
  const saved = localStorage.getItem('blueframe_theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
    return 'dark';
  }
  return 'light';
}

export function getTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem('blueframe_theme') === 'dark' ? 'dark' : 'light';
}
