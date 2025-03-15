import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Enable connections from all network interfaces
    host: '0.0.0.0',
    // Configure CORS to allow requests from any origin
    cors: true,
    // Allow CloudStudio preview domains
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.preview.cloudstudio.work'
    ]
  },
});