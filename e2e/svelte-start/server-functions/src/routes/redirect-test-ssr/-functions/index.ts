import { redirect } from '@tanstack/svelte-router'
import { createServerFn } from '@tanstack/svelte-start'

export const $redirectServerFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    throw redirect({ to: '/redirect-test-ssr/target' })
  },
)
