import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/svelte-start/plugin/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), tanstackStart(), svelte()],
})
