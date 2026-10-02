<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { z } from 'zod'

  export const Route = createFileRoute('/search-params/default')({
    validateSearch: z.object({
      default: z.string().default('d1'),
    }),
    beforeLoad: ({ context }) => {
      if (context.hello !== 'world') {
        throw new Error('Context hello is not "world"')
      }
    },
    loader: ({ context }) => {
      if (context.hello !== 'world') {
        throw new Error('Context hello is not "world"')
      }
    },
  })
</script>

<script lang="ts">
  const search = Route.useSearch()
  const context = Route.useRouteContext()
</script>

<div data-testid="search-default">{search.current.default}</div>
<div data-testid="context-hello">{context.current.hello}</div>
