/* eslint-env node */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy any /api/* request to your Render API
      '/api': {
        target: 'https://aiventa-crm.onrender.com',
        changeOrigin: true,
        // Keep the /api prefix when forwarding requests so backend routes match
        // the expected /api/* paths.
      },
    },
  },
  // Optional: expose your prod env var under a simpler name
  define: {
    __API_BASE__: JSON.stringify(process.env.VITE_API_BASE_URL || '/api'),
  },
});
