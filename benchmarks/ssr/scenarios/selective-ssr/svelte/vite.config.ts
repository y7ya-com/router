import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import codspeedPlugin from '@codspeed/vitest-plugin'
import { tanstackStart } from '@tanstack/svelte-start/plugin/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { cpuSimulationExecArgv } from '../../../../cpu-simulation'

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
    execArgv: cpuSimulationExecArgv(),
    isolate: true,
    name: '@benchmarks/ssr selective-ssr (svelte)',
    watch: false,
    environment: 'node',
  },
})
