import { createServerFn } from '@tanstack/svelte-start'

export const expectedValue = 'Hello from a server function!'
export const rawResponseFn = createServerFn().handler(() => {
  return new Response(expectedValue)
})
