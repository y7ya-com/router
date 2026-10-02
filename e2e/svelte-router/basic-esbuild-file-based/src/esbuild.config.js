import { tanstackRouter } from '@tanstack/router-plugin/esbuild'
import sveltePlugin from 'esbuild-svelte'

export default {
  // ...
  conditions: ['svelte', 'browser'],
  mainFields: ['svelte', 'browser', 'module', 'main'],
  plugins: [
    sveltePlugin({
      compilerOptions: { css: 'injected' },
    }),
    tanstackRouter({
      target: 'svelte',
      autoCodeSplitting: true,
    }),
  ],
}
