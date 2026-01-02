import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use root path for GitHub Pages deployment from main branch
export default defineConfig({
  plugins: [react()],
  base: '/',
})

