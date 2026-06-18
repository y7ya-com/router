import path from 'node:path'
import url from 'node:url'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const ssrBuildConfig = {
  ssr: true,
  outDir: 'dist/server',
  ssrEmitAssets: true,
  copyPublicDir: false,
  emptyOutDir: true,
  rolldownOptions: {
    input: path.resolve(__dirname, 'src/entry-server.ts'),
    output: { entryFileNames: '[name].js' },
  },
}

const clientBuildConfig = {
  outDir: 'dist/client',
  emitAssets: true,
  copyPublicDir: true,
  emptyOutDir: true,
  rolldownOptions: {
    input: path.resolve(__dirname, 'src/entry-client.ts'),
    output: {
      entryFileNames: 'static/[name].js',
      chunkFileNames: 'static/assets/[name]-[hash].js',
      assetFileNames: 'static/assets/[name]-[hash][extname]',
    },
  },
}

export default defineConfig((configEnv) => ({
  plugins: [
    tanstackRouter({
      target: 'svelte',
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    svelte(),
  ],
  build: configEnv.isSsrBuild ? ssrBuildConfig : clientBuildConfig,
}))
