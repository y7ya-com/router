import {
  createMiddleware,
  createServerFn,
  getRouterInstance,
} from '@tanstack/svelte-start'

const middleware = createMiddleware({ type: 'function' }).client(
  async ({ next }) => {
    const router = await getRouterInstance()
    return next({
      sendContext: {
        routerContext: router.options.context,
      },
    })
  },
)

export const serverFn = createServerFn()
  .middleware([middleware])
  .handler(({ context }) => {
    return context.routerContext
  })
