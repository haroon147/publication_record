import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use base path for production builds (GitHub Pages), but '/' for local development
export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  base: command === 'build' ? '/publication_record/' : '/',
}))

