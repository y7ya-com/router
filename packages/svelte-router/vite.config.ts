import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'
import { defineConfig } from 'vitest/config'
import packageJson from './package.json'
import type { ViteUserConfig } from 'vitest/config'

const config = defineConfig(({ mode }) => {
  if (mode === 'server') {
    return {
      plugins: [svelte()] as ViteUserConfig['plugins'],
      test: {
        name: `${packageJson.name} (server)`,
        dir: './tests/server',
        watch: false,
        environment: 'node',
        typecheck: { enabled: true },
      },
    }
  }

  return {
    plugins: [svelte(), svelteTesting()] as ViteUserConfig['plugins'],
    ...(process.env.VITEST && {
      resolve: {
        conditions: ['development'],
      },
    }),
    test: {
      name: packageJson.name,
      dir: './tests',
      exclude: ['server'],
      watch: false,
      environment: 'jsdom',
      typecheck: { enabled: true },
      setupFiles: ['./tests/test-setup.ts'],
      alias: {
        '@testing-library/svelte': '@testing-library/svelte/svelte5',
      },
    },
  }
})

export default config
