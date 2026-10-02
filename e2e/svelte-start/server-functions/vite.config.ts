import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/svelte-start/plugin/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

const FUNCTIONS_WITH_CONSTANT_ID = [
  'src/routes/-functions/submit-post-formdata.ts/greetUser_createServerFn_handler',
  'src/routes/formdata-redirect/-functions/index.ts/greetUser_createServerFn_handler',
]

export default defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    port: 3000,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      serverFns: {
        generateFunctionId: (opts) => {
          const id = `${opts.filename}/${opts.functionName}`
          if (FUNCTIONS_WITH_CONSTANT_ID.includes(id)) {
            return 'constant_id'
          } else {
            return undefined
          }
        },
      },
    }),
    svelte(),
  ],
})
