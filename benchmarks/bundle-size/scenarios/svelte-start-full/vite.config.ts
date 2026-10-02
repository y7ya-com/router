import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { tanstackStart } from '@tanstack/svelte-start/plugin/vite'

export default defineConfig({
  plugins: [tanstackStart(), svelte()],
})
