<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { homeItems } from '../../../shared'

  export const Route = createFileRoute('/')({
    loader: () => homeItems(),
  })
</script>

<script lang="ts">
  import { readyTestId } from '../../../shared'

  const items = Route.useLoaderData()
</script>

<main>
  <h1 data-testid={readyTestId}>{`Home (${items.current.length} items)`}</h1>
  <ul>
    {#each items.current as item (item.id)}
      <li>{`${item.label}: ${item.score}`}</li>
    {/each}
  </ul>
</main>
