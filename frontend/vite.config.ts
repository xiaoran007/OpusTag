import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        // Use environment variable for backend URL if provided, otherwise default to localhost
        // In Docker, this should be set to 'http://backend:8000'
        target: process.env.VITE_API_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
