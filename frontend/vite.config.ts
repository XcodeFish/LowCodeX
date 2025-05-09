import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createStyleImportPlugin, AntdResolve } from 'vite-plugin-style-import';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    createStyleImportPlugin({
      resolves: [AntdResolve()],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'primary-color': '#1890ff',
          'link-color': '#1890ff',
          'border-radius-base': '2px',
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3100',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
