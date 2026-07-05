import { Serwist, NetworkFirst, CacheFirst, StaleWhileRevalidate, ExpirationPlugin, CacheableResponsePlugin } from "serwist";

const serwist = new Serwist({
  precacheEntries: [
    { url: "/offline", revision: "1" },
  ],
  runtimeCaching: [
    {
      matcher: /^\/api\/sync\//,
      handler: new NetworkFirst({
        cacheName: "api-sync",
        networkTimeoutSeconds: 5,
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 3600 }),
        ],
      }),
    },
    {
      matcher: /^\/api\//,
      handler: new NetworkFirst({
        cacheName: "api-other",
        networkTimeoutSeconds: 5,
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 1800 }),
        ],
      }),
    },
    {
      matcher: /^\/dashboard/,
      handler: new NetworkFirst({
        cacheName: "pages-dashboard",
        networkTimeoutSeconds: 3,
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 86400 }),
        ],
      }),
    },
    {
      matcher: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: new CacheFirst({
        cacheName: "images",
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 2592000 }),
        ],
      }),
    },
    {
      matcher: /\.(?:js|css)$/,
      handler: new StaleWhileRevalidate({
        cacheName: "static-assets",
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 86400 }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();
