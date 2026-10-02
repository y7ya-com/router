import { defineConfig } from '@rsbuild/core'
import { pluginSvelte } from '@rsbuild/plugin-svelte'
import { tanstackStart } from '@tanstack/svelte-start/plugin/rsbuild'
import { isPrerender } from './tests/utils/isPrerender'

const outDir = process.env.E2E_DIST_DIR ?? 'dist'

export default defineConfig({
  plugins: [pluginSvelte(), tanstackStart()],
  source: {
    define: {
      __TSR_PRERENDER__: JSON.stringify(isPrerender),
    },
  },
  output: {
    distPath: {
      root: outDir,
    },
  },
})
