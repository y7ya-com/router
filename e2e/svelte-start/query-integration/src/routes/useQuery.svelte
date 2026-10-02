<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { makeQueryOptions } from '~/queryOptions'

  const qOptions = makeQueryOptions('useQuery')

  export const Route = createFileRoute('/useQuery')({
    loader: ({ context }) => context.queryClient.ensureQueryData(qOptions),
    ssr: true,
  })
</script>

<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  const query = createQuery(() => qOptions)
</script>

<div>
  <div>
    query data:
    <div data-testid="query-data">{query.data ?? 'loading...'}</div>
  </div>
</div>
