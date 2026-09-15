import { expectTypeOf, test } from 'vitest'
import { CatchBoundary } from '../../src'

declare const internals: any
declare const snippet: any

test('Svelte boundary errors default to Error', () => {
  CatchBoundary(internals, {
    getResetKey: () => 0,
    onCatch: (error) => {
      expectTypeOf(error).toEqualTypeOf<Error>()
    },
    children: snippet,
  })
})
