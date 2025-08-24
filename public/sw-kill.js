self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            try {
                const keys = await caches.keys();
                await Promise.all(keys.map((k) => caches.delete(k)));
            } catch { }
            try {
                await self.clients.claim();
            } catch { }
            try {
                // Unregister this killer SW after taking over
                await self.registration.unregister();
            } catch { }
            try {
                // Reload all controlled clients to fetch fresh assets
                const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
                for (const client of clients) {
                    client.navigate(client.url);
                }
            } catch { }
        })()
    );
});

self.addEventListener('fetch', (event) => {
    // Always go to network; no caching
    event.respondWith(fetch(event.request));
});


