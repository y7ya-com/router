import { createServerFn } from '@tanstack/svelte-start'

/**
 * This checks whether the server function can
 * return null without throwing an error or returning something else.
 * @link https://github.com/TanStack/router/issues/2776
 */

export const $allow_return_null_getFn = createServerFn().handler(async () => {
  return null
})
export const $allow_return_null_postFn = createServerFn({
  method: 'POST',
}).handler(async () => {
  return null
})
