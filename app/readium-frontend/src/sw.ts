/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { RangeRequestsPlugin } from 'workbox-range-requests';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request, url }) => request.method === 'GET' && /^\/api\/books\/\d+\/file$/.test(url.pathname),
  new CacheFirst({
    cacheName: 'readium-pdf-cache-v1',
    plugins: [
      new RangeRequestsPlugin(),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) => request.mode === 'navigate' && !url.pathname.startsWith('/api'),
  new NetworkFirst({
    cacheName: 'readium-pages-cache-v1',
  }),
);

registerRoute(
  ({ request, url }) => (
    request.method === 'GET'
    && ['style', 'script', 'worker', 'font'].includes(request.destination)
    && !url.pathname.startsWith('/api')
  ),
  new StaleWhileRevalidate({
    cacheName: 'readium-assets-cache-v1',
  }),
);

export {};
