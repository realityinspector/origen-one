import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, '../shared'),
    },
  },
  server: {
    port: 5001,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      external: [
        'react-native',
        'react-native-web',
        'react-native-gesture-handler',
        'react-native-reanimated',
        'react-native-svg',
        'react-native-markdown-display'
      ]
    }
  },
});
