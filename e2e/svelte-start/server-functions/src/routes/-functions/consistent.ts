import { createServerFn } from '@tanstack/svelte-start'

/**
 * This checks whether the returned payloads from a
 * server function are the same, regardless of whether the server function is
 * called directly from the client or from within the server function.
 * @link https://github.com/TanStack/router/issues/1866
 * @link https://github.com/TanStack/router/issues/2481
 */

export const cons_getFn1 = createServerFn()
  .validator((d: { username: string }) => d)
  .handler(({ data }) => {
    return { payload: data }
  })

export const cons_serverGetFn1 = createServerFn()
  .validator((d: { username: string }) => d)
  .handler(async ({ data }) => {
    return cons_getFn1({ data })
  })

export const cons_postFn1 = createServerFn({ method: 'POST' })
  .validator((d: { username: string }) => d)
  .handler(({ data }) => {
    return { payload: data }
  })

export const cons_serverPostFn1 = createServerFn({ method: 'POST' })
  .validator((d: { username: string }) => d)
  .handler(({ data }) => {
    return cons_postFn1({ data })
  })
