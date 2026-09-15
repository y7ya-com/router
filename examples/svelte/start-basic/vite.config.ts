import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { tanstackStart } from '@tanstack/svelte-start/plugin/vite'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [tanstackStart(), svelte()],
})
