import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 使用相对路径，适配 Electron
  build: {
    outDir: 'dist-electron/renderer', // Electron 渲染进程输出目录
  },
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ['**/dist-electron/**', '**/node_modules/**']
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'reactflow', 'recharts'],
    force: false,
    exclude: ['dist-electron']
  }
})
