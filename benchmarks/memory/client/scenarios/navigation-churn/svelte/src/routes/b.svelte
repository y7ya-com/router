<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  const fixedTimestamp = 1_700_000_000_000

  export const Route = createFileRoute('/b')({
    loader: () => ({ name: 'b', ts: fixedTimestamp }),
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<main data-bench-page="b">{`${data.current.name}:${data.current.ts}`}</main>
