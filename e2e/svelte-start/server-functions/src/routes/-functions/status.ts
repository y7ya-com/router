import { createServerFn } from '@tanstack/svelte-start'
import { setResponseStatus } from '@tanstack/svelte-start/server'

export const helloFn = createServerFn().handler(() => {
  setResponseStatus(225, `hello`)
  return {
    hello: 'world',
  }
})
