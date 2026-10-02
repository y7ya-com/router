import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    watch: false,
    projects: [
      './svelte/vite.config.ts',
      './scenarios/*/svelte/vite.config.ts',
    ],
  },
})
