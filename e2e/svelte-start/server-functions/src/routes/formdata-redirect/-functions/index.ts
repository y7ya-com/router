import { redirect } from '@tanstack/svelte-router'
import { createServerFn } from '@tanstack/svelte-start'

export const greetUser = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) {
      throw new Error('Invalid! FormData is required')
    }
    const name = data.get('name')

    if (!name) {
      throw new Error('Name is required')
    }

    return {
      name: name.toString(),
    }
  })
  .handler(({ data: { name } }) => {
    throw redirect({ to: '/formdata-redirect/target/$name', params: { name } })
  })
