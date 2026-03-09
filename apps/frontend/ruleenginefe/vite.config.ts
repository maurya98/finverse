import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { PluginOption } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: "/ruleenginefe/",
  plugins: [react() as PluginOption],
  server: {
    port: 5004,
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@finverse/jdm-editor'],
  },
})
