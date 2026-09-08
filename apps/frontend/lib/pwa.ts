"use client";
import { useState, useEffect } from "react";
import { API_URL } from '@/lib/api';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    
    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);
    
    const handler = (e: Event) => {
      e.preventDefault();
      console.log('beforeinstallprompt captured');
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      console.log('App installed');
      setIsInstalled(true);
      setInstallPrompt(null);
    });
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) {
      console.log('No install prompt available');
      return false;
    }
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      console.log('Install choice:', choice.outcome);
      if (choice.outcome === 'accepted') {
        setInstallPrompt(null);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Install error:', e);
      return false;
    }
  };

  return { installPrompt, isInstalled, isIOS, promptInstall };
}

export function usePWA() {
  const [isSupported, setIsSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported('serviceWorker' in navigator && 'Notification' in window);
      if ('Notification' in window) setNotificationPermission(Notification.permission);
      
      // Register SW on mount
      registerServiceWorker().then(r => setSwRegistered(r));
    }
  }, []);

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return false;
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', reg.scope);
      return true;
    } catch (e) {
      console.error('SW registration failed:', e);
      return false;
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return false;
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (e) {
      console.error('Permission error:', e);
      return false;
    }
  };

  // ✅ روش صحیح نمایش نوتیفیکیشن (رفع خطای Illegal constructor)
  const showNotification = async (title: string, body: string) => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          dir: 'rtl',
          lang: 'fa',
          vibrate: [200, 100, 200]
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Show notification error:', e);
      return false;
    }
  };

  return { 
    isSupported, 
    notificationPermission, 
    swRegistered,
    registerServiceWorker, 
    requestNotificationPermission,
    showNotification 
  };
}
