<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/redirect-test-ssr/')({
    ssr: true,
  })
</script>

<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  import { useServerFn } from '@tanstack/svelte-start'
  import { $redirectServerFn as redirectServerFn } from './-functions/index'

  const redirectFn = useServerFn(redirectServerFn)
  const query = createQuery(() => ({
    queryKey: ['redirect-test-ssr'],
    queryFn: () => redirectFn(),
  }))
</script>

<div>
  <h1 data-testid="redirect-source-ssr">Redirect Source SSR</h1>
  {#if query.isPending}
    <div>Loading...</div>
  {:else}
    <div>{JSON.stringify(query.data)}</div>
  {/if}
</div>
