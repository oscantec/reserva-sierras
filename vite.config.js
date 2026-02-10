import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Google Sheets utils will be dynamically imported to avoid build-time dependencies
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    port: 3000,
    open: true
  }
})
