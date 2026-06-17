// @ts-check

import pluginSvelte from 'eslint-plugin-svelte'
import rootConfig from '../../eslint.config.js'

export default [
  ...rootConfig,
  ...pluginSvelte.configs['flat/recommended'],
  {
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      'svelte/block-lang': ['error', { script: ['ts'] }],
      'svelte/valid-compile': 'off',
    },
  },
]
