import { createMiddleware, createServerFn } from '@tanstack/svelte-start'
import { getRequest } from '@tanstack/svelte-start/server'

const requestMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next, request }) => {
    return next({
      context: {
        requestParam: request.url,
        requestFunc: getRequest().url,
      },
    })
  },
)

export const serverFn = createServerFn()
  .middleware([requestMiddleware])
  .handler(async ({ context: { requestParam, requestFunc } }) => {
    return { requestParam, requestFunc }
  })

export type ServerFnResult = Awaited<ReturnType<typeof serverFn>>
