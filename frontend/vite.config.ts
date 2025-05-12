import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 暂时注释掉这个插件，它需要consola依赖
    // createStyleImportPlugin({
    //   resolves: [AntdResolve()],
    // }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
      // 强制所有React导入指向同一位置
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'react/jsx-dev-runtime': path.resolve('./node_modules/react/jsx-dev-runtime'),
      'react/jsx-runtime': path.resolve('./node_modules/react/jsx-runtime')
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          $primary-color: #1890ff;
          $link-color: #1890ff;
          $border-radius-base: 2px;
        `,
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
