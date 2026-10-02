import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import codspeedPlugin from '@codspeed/vitest-plugin'
import { cpuSimulationExecArgv } from '../../cpu-simulation'

// Anchor the project root to the package directory so this config resolves
// identically when run directly and as part of an aggregate `projects` config.
const rootDir = fileURLToPath(new URL('..', import.meta.url))

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
    outDir: './svelte/dist',
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: './svelte/app.ts',
      formats: ['es'],
      fileName: 'app',
    },
  },
  test: {
    execArgv: cpuSimulationExecArgv(),
    name: '@benchmarks/client-nav (svelte)',
    watch: false,
    environment: 'jsdom',
    setupFiles: [`${rootDir}vitest.setup.ts`],
  },
})
