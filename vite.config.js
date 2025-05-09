import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 设置 @ 指向 src 目录
    },
  },
  plugins: [vue(),
    electron({
      entry: 'main.js',
})
  ],
  build: {
    emptyOutDir: false, // 确保 Electron 构建时不会清空输出目录
  },
  server: {
    port: 3000
  }

})