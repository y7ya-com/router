<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/a')({
    loader: () => ({ id: 'a' }),
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<main data-bench-page={data.current.id}>{data.current.id}</main>
