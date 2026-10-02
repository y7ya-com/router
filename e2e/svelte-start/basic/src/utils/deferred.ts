import { createServerFn } from '@tanstack/svelte-start'

export const personServerFn = createServerFn({ method: 'GET' })
  .validator((data: { name: string }) => data)
  .handler(({ data }) => {
    return { name: data.name, randomNumber: Math.floor(Math.random() * 100) }
  })

export const slowServerFn = createServerFn({ method: 'GET' })
  .validator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    await new Promise((r) => setTimeout(r, 1000))
    return { name: data.name, randomNumber: Math.floor(Math.random() * 100) }
  })
