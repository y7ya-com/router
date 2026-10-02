import { createFileRoute } from '@tanstack/svelte-router'

export const Route = createFileRoute('/api/users/$id')({
  server: {
    handlers: {
      GET: ({ params }) =>
        Response.json({
          id: params.id,
          name: `user-${params.id}`,
          roles: ['a', 'b', 'c'],
        }),
    },
  },
})
