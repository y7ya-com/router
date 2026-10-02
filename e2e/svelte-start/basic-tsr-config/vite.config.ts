import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/svelte-start/plugin/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    port: 3000,
  },
  plugins: [
    tanstackStart({
      srcDirectory: './src/app',
    }),
    svelte(),
  ],
})
