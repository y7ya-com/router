import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import codspeedPlugin from '@codspeed/vitest-plugin'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { cpuSimulationExecArgv } from '../../../../cpu-simulation'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: rootDir,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  plugins: [
    !!(process.env.VITEST && process.env.WITH_INSTRUMENTATION) &&
      codspeedPlugin(),
    tanstackRouter({
      target: 'svelte',
      routesDirectory: `${rootDir}src/routes`,
      generatedRouteTree: `${rootDir}src/routeTree.gen.ts`,
    }),
    svelte(),
  ],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: './src/main.ts',
      formats: ['es'],
      fileName: 'app',
    },
  },
  test: {
    execArgv: cpuSimulationExecArgv(),
    name: '@benchmarks/client-nav control-flow (svelte)',
    watch: false,
    environment: 'jsdom',
    setupFiles: ['../../../vitest.setup.ts'],
  },
})
