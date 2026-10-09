import { defineConfig } from 'vite';

// The API (Express) listens on 3000; the dev server proxies to it so the app
// can call /api and /images on its own origin.
const api = process.env.VITE_DEV_API_TARGET || 'http://localhost:3000';
const proxy = { '/api': api, '/images': api };

export default defineConfig({
  server: { port: 5173, host: '0.0.0.0', proxy },
  preview: { port: 5173, host: '0.0.0.0', proxy },
  // src/api loads the body list with top-level await.
  build: { target: 'es2022' },
});
