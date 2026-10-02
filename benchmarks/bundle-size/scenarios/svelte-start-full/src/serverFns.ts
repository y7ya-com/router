import { createMiddleware, createServerFn } from '@tanstack/svelte-start'

const requestMiddleware = createMiddleware().server(async ({ next }) => {
  return next()
})

const functionMiddleware = createMiddleware({ type: 'function' })
  .client(async ({ next }) => {
    return next()
  })
  .server(async ({ next }) => {
    return next()
  })

export const helloServerFn = createServerFn({ method: 'GET' })
  .middleware([requestMiddleware, functionMiddleware])
  .handler(async () => {
    return 'hello from server fn'
  })
