import { createServerFn } from '@tanstack/svelte-start'
import { makeNested } from '~/data'

export const serverFnReturningNested = createServerFn().handler(() => {
  return makeNested()
})
