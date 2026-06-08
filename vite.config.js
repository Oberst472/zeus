import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = repository && !repository.endsWith('.github.io') ? `/${repository}/` : '/'

export default defineConfig({
  base,
  plugins: [vue()],
  server: {
    port: 5173,
    open: true
  }
})
