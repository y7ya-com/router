import { createFileRoute } from '@tanstack/svelte-router'

export const Route = createFileRoute('/api/params/$foo/$bar')({
  server: {
    handlers: {
      GET: ({ params }) => {
        return new Response('hello, ' + params.foo + ' and ' + params.bar)
      },
    },
  },
})
