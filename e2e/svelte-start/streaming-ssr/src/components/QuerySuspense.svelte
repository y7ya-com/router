<script lang="ts">
  import { createQuery, useQueryClient } from '@tanstack/svelte-query'
  import type { QueryOptions } from '~/queryOptions'

  let {
    queryOpts,
    testId,
    fallback,
  }: {
    queryOpts: QueryOptions
    testId: string
    fallback: string
  } = $props()

  const queryClient = useQueryClient()
  if (typeof window === 'undefined') {
    // svelte-ignore state_referenced_locally
    void queryClient.prefetchQuery(queryOpts)
  }

  const query = createQuery(() => queryOpts)
</script>

{#if query.isSuccess}
  <div data-testid={testId}>
    {query.data?.value} (source: {query.data?.source})
  </div>
{:else}
  <div data-testid={`${testId}-loading`}>{fallback}</div>
{/if}
