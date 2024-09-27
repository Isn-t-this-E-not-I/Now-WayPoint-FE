import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  define: {
    global: 'window',
  },
  build: {
    rollupOptions: {
      input: 'index.html', // 명시적으로 index.html 파일을 설정
    },
    outDir: 'dist',
  },
})