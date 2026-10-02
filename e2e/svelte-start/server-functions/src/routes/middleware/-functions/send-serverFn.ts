import { createMiddleware, createServerFn } from '@tanstack/svelte-start'

const middleware = createMiddleware({ type: 'function' }).client(
  async ({ next }) => {
    return next({
      sendContext: {
        serverFn: barFn,
      },
    })
  },
)

export const fooFn = createServerFn()
  .middleware([middleware])
  .handler(({ context }) => {
    return context.serverFn()
  })
const barFn = createServerFn().handler(() => {
  return 'bar'
})
