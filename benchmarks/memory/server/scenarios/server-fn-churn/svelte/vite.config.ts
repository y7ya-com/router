import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import codspeedPlugin from '@codspeed/vitest-plugin'
import { tanstackStart } from '@tanstack/svelte-start/plugin/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { memoryConfig } from '../../../../runtime'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: rootDir,
  plugins: [
    !!(process.env.VITEST && process.env.WITH_INSTRUMENTATION) &&
      codspeedPlugin(),
    tanstackStart({
      srcDirectory: 'src',
    }),
    svelte(),
  ],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    minify: false,
  },
  test: {
    ...memoryConfig('server'),
    name: '@benchmarks/memory-server server-fn-churn (svelte)',
    watch: false,
    environment: 'node',
  },
})
