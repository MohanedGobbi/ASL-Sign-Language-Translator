import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    exclude: ['@mediapipe/tasks-vision'],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        translate: resolve(__dirname, 'translate.html'),
        practice: resolve(__dirname, 'practice.html'),
      },
    },
  },
})
