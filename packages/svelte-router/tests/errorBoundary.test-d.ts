import { expectTypeOf, test } from 'vitest'
import { createRootRoute, createRouter } from '../src'
import type { ErrorComponentProps } from '../src'

test('Svelte boundary errors default to Error', () => {
  expectTypeOf<ErrorComponentProps['error']>().toEqualTypeOf<Error>()
  expectTypeOf<ErrorComponentProps<unknown>['error']>().toEqualTypeOf<unknown>()
  const routeTree = createRootRoute({
    onCatch: (error) => {
      expectTypeOf(error).toEqualTypeOf<Error>()
    },
    onError: (error) => {
      expectTypeOf(error).toBeAny()
    },
  })
  createRouter({
    routeTree,
    defaultOnCatch: (error) => {
      expectTypeOf(error).toEqualTypeOf<Error>()
    },
  })
})
