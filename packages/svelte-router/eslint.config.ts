// @ts-check

import pluginSvelte from 'eslint-plugin-svelte'
import rootConfig from '../../eslint.config.js'

export default [
  ...rootConfig,
  ...pluginSvelte.configs['flat/recommended'],
  {
    files: ['src/**/*.svelte.ts'],
    rules: {
      'import/newline-after-import': 'off',
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      'svelte/block-lang': ['error', { script: ['ts'] }],
      'svelte/no-svelte-internal': 'error',
      'svelte/valid-compile': 'off',
    },
  },
]
