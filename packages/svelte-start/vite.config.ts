import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'
import { tsxSvelte } from 'jsx-svelte'
import { defineConfig } from 'vitest/config'
import packageJson from './package.json'
import type { ViteUserConfig } from 'vitest/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Resolve the svelte packages to src rather than a (possibly stale) dist.
const alias = {
  '@tanstack/svelte-router': resolve(__dirname, '../svelte-router/src'),
  '@tanstack/svelte-start-client': resolve(
    __dirname,
    '../svelte-start-client/src',
  ),
  '@tanstack/svelte-start-server': resolve(
    __dirname,
    '../svelte-start-server/src',
  ),
  '@tanstack/svelte-start': resolve(__dirname, '../svelte-start/src'),
  '@tanstack/svelte-router-devtools': resolve(
    __dirname,
    '../svelte-router-devtools/src',
  ),
}

export default defineConfig({
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
    watch: false,
    environment: 'jsdom',
    typecheck: { enabled: true },
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
})
