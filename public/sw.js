const CACHE_NAME = 'work-time-tracker-v1';
const urlsToCache = [
    '/',
    '/static/css/main.css',
    '/static/js/main.js',
    '/manifest.json',
    '/offline.html',
];

// インストール
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// フェッチ
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュからレスポンスを返すか、ネットワークからフェッチ
                if (response) {
                    return response;
                }

                return fetch(event.request).catch(() => {
                    // オフライン時のフォールバック
                    if (event.request.destination === 'document') {
                        return caches.match('/offline.html');
                    }
                });
            })
    );
});

// アクティベート
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// プッシュ通知
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'work-time-tracker',
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: '表示',
                icon: '/icon-32x32.png'
            },
            {
                action: 'close',
                title: '閉じる',
                icon: '/icon-32x32.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Work Time Tracker', options)
    );
});

// 通知クリック
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
}); 