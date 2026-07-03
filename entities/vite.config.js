import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const srcRoot = path.resolve(__dirname, 'src').replace(/\\/g, '/')
const componentsRoot = path.resolve(__dirname, 'src/api/components').replace(/\\/g, '/')

export default defineConfig({
  root: path.resolve(__dirname),
  resolve: {
    alias: [
      { find: /^@\/components$/, replacement: componentsRoot },
      { find: /^@\/components\/(.+)$/, replacement: `${componentsRoot}/$1` },
      { find: '@', replacement: srcRoot },
      { find: /^@\//, replacement: `${srcRoot}/` }
    ]
  },
  server: {
    fs: {
      strict: false
    }
  },
  plugins: [react()],
})
