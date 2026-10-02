import { defineConfig } from '@rsbuild/core'
import { pluginSvelte } from '@rsbuild/plugin-svelte'
import { tanstackRouter } from '@tanstack/router-plugin/rspack'

export default defineConfig({
  plugins: [pluginSvelte()],
  tools: {
    rspack: {
      plugins: [tanstackRouter({ target: 'svelte', autoCodeSplitting: true })],
    },
  },
})
