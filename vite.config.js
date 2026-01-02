import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use repository name as base path for GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/publication_record/',
})

