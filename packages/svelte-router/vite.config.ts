import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'
import { tsxSvelte } from 'jsx-svelte'
import { defineConfig } from 'vitest/config'
import packageJson from './package.json'
import type { ViteUserConfig } from 'vitest/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Tests import the package by name, as a consumer would; resolve that to src
// rather than a (possibly stale) dist.
const alias = { '@tanstack/svelte-router': resolve(__dirname, 'src') }

const config = defineConfig(({ mode }) => {
  if (mode === 'server') {
    return {
      plugins: [tsxSvelte(), svelte()] as ViteUserConfig['plugins'],
      resolve: { alias },
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
    plugins: [
      tsxSvelte(),
      svelte(),
      svelteTesting(),
    ] as ViteUserConfig['plugins'],
    resolve: {
      alias,
      ...(process.env.VITEST && { conditions: ['development'] }),
    },
    test: {
      name: packageJson.name,
      dir: './tests',
      exclude: ['server'],
      watch: false,
      environment: 'jsdom',
      typecheck: { enabled: true },
      setupFiles: ['./tests/test-setup.ts'],
      // @tanstack/* dists use extensionless relative imports, which Vite resolves
      // but Node does not, so keep them inlined. The Start cores are the
      // exception: they import `#tanstack-router-entry`, an imports-map specifier
      // vitest's inliner can't resolve, so Node loads those from their dists.
      server: {
        deps: {
          inline: [/@tanstack\/(?!start-server-core|start-client-core)/],
          external: [
            /@tanstack\/start-server-core/,
            /@tanstack\/start-client-core/,
          ],
        },
      },
      alias: {
        '@testing-library/svelte': '@testing-library/svelte/svelte5',
      },
    },
  }
})

export default config
