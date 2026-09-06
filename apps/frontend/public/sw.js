const CACHE_NAME = 'blueframe-v1';
const STATIC_ASSETS = ['/', '/login', '/dashboard', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('localhost:50001') || event.request.url.includes('/api/')) return;
  event.respondWith(
    fetch(event.request).then(r => {
      if (r.status === 200) {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
      }
      return r;
    }).catch(() => caches.match(event.request).then(r => r || caches.match('/login')))
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'blueFrame', body: 'پیام جدید' };
  event.waitUntil(self.registration.showNotification(data.title || 'blueFrame', {
    body: data.body || 'پیام جدید',
    icon: '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    dir: 'rtl',
    lang: 'fa'
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/dashboard'));
});
