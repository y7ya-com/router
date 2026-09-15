import { expect, test } from 'vitest'
import { tanstackStart } from '../src/plugin/vite'

function runConfigResolved(environments: Record<string, any>) {
  const plugin = (tanstackStart() as Array<any>)
    .flat(Infinity)
    .find((p) => p?.name === 'tanstack-svelte-start:config')
  plugin.configResolved.handler({ environments })
}

test('strips start packages from dev ssr externals', () => {
  const ssr = {
    resolve: {
      external: [
        'isbot',
        '@tanstack/start-server-core',
        '@tanstack/svelte-router',
      ],
      noExternal: [],
    },
  }
  runConfigResolved({ ssr })
  expect(ssr.resolve.external).toEqual(['isbot'])
})

test('clears externals in an environment that bundles every dependency', () => {
  const worker = {
    resolve: { external: ['isbot', '@tanstack/history'], noExternal: true },
  }
  runConfigResolved({ ssr: worker })
  expect(worker.resolve.external).toEqual([])
})
