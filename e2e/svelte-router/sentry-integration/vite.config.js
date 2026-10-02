import { defineConfig } from 'vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), svelte(), sentryVitePlugin()],
})
