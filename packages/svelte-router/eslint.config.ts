// @ts-check

import pluginSvelte from 'eslint-plugin-svelte'
import tsParser from '@typescript-eslint/parser'
import rootConfig from '../../eslint.config.js'
import svelteConfig from './svelte.config.js'

export default [
  ...rootConfig,
  ...pluginSvelte.configs['flat/recommended'],
  {
    // `svelte-eslint-parser` parses the markup, but it delegates `<script>`
    // blocks to whatever `parserOptions.parser` says. Without this it falls
    // back to plain JS and every `<script lang="ts">` dies on the first
    // `import type { … }` — which silently disabled linting for the whole
    // component surface.
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.svelte'],
        svelteConfig,
      },
    },
  },
  {
    // Route-aware type fixtures register a router globally, so they are
    // type-checked in their own program (see tsconfig.types.json).
    files: ['tests/typing/**'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.types.json',
      },
    },
  },
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
