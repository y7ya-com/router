import { createServerFn } from '@tanstack/svelte-start'

export const fnInsideRoute = createServerFn({ method: 'GET' }).handler(
  ({ method }) => {
    return {
      name: 'fnInsideRoute',
      method,
    }
  },
)
