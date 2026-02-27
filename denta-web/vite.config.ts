// GENERATED_STUB — Vite config for DentaApp PWA
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.ico", "apple-touch-icon.png", "pwa-192x192.png", "pwa-512x512.png"],
            manifest: {
                name: "DentaApp",
                short_name: "Denta",
                description: "Gestión integral de consultorios dentales",
                theme_color: "#0ea5e9",
                background_color: "#ffffff",
                display: "standalone",
                scope: "/",
                start_url: "/",
                icons: [
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable",
                    },
                ],
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "supabase-api",
                            expiration: { maxEntries: 100, maxAgeSeconds: 3600 },
                        },
                    },
                    {
                        urlPattern: /\/api\/.*/i,
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "local-api",
                            expiration: { maxEntries: 100, maxAgeSeconds: 3600 },
                        },
                    },
                    {
                        urlPattern: ({ request }) =>
                            request.destination === "style" ||
                            request.destination === "script" ||
                            request.destination === "image" ||
                            request.destination === "font",
                        handler: "CacheFirst",
                        options: {
                            cacheName: "static-assets",
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 24 * 60 * 60 * 30, // 30 days
                            },
                        },
                    },
                ],
            },
        }),
    ],
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:8000",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
});
