import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/leads': 'http://localhost:5000',
      '/scrape': 'http://localhost:5000',
    }
  }
})