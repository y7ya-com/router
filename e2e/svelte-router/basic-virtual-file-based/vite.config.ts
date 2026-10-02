import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { routes } from './routes'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: 'svelte',
      autoCodeSplitting: true,
      virtualRouteConfig: routes,
    }),
    svelte(),
  ],
})
