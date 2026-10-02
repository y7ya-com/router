import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import codspeedPlugin from '@codspeed/vitest-plugin'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { memoryConfig } from '../../../../runtime'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: rootDir,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  plugins: [
    !!(process.env.VITEST && process.env.WITH_INSTRUMENTATION) &&
      codspeedPlugin(),
    svelte(),
  ],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: './src/app.ts',
      formats: ['es'],
      fileName: 'app',
    },
  },
  test: {
    ...memoryConfig('client'),
    name: '@benchmarks/memory-client loader-data-retention (svelte)',
    watch: false,
    environment: 'jsdom',
  },
})
