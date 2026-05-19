import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/leads': 'http://localhost:5000',
      '/manual-leads': 'http://localhost:5000',
      '/scrape': 'http://localhost:5000',
      '/auth': 'http://localhost:5000',
      '/followups': 'http://localhost:5000',
      '/projects': 'http://localhost:5000',
      '/services': 'http://localhost:5000',
      '/weekly-review': 'http://localhost:5000',
      '/stats': 'http://localhost:5000',
    }
  }
})