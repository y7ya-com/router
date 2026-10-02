<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { sectionItems } from '../../../shared'

  export const Route = createFileRoute('/sections/$section')({
    loader: ({ params }) => {
      const items = sectionItems(params.section)
      const checksum = items.reduce(
        (sum, item) => (sum + item.value) % 1_000_000_007,
        0,
      )
      return { items, checksum }
    },
    staleTime: 0,
    gcTime: 0,
  })
</script>

<script lang="ts">
  const params = Route.useParams()
  const data = Route.useLoaderData()
</script>

<main>
  <p data-testid="page-state">
    {`${params.current.section}:${data.current.checksum}`}
  </p>
  <ul>
    {#each data.current.items as item (item.name)}
      <li>{`${item.name}=${item.value}`}</li>
    {/each}
  </ul>
</main>
