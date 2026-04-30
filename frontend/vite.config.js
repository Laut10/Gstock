import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Todo lo que arranca con /api se redirige al backend.
      // Así el frontend hace `fetch('/api/...')` sin preocuparse de CORS en dev.
      '/api': 'http://localhost:3001',
    },
  },
});
