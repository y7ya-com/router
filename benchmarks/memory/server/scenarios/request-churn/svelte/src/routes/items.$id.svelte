<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  const itemIndexes = Array.from({ length: 5 }, (_, index) => index)

  type ItemSearch = {
    q: string
  }

  export const Route = createFileRoute('/items/$id')({
    validateSearch: (search: Record<string, unknown>): ItemSearch => ({
      q: typeof search.q === 'string' ? search.q : '',
    }),
    loaderDeps: ({ search }) => ({ q: search.q }),
    loader: ({ params, deps }) => ({
      id: params.id,
      title: `Item ${params.id}`,
      q: deps.q,
      items: itemIndexes.map((index) => ({
        id: `${params.id}-${index}`,
        label: `${deps.q}-${index}`,
      })),
    }),
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<main data-bench="request-churn-item">
  <h1>{data.current.title}</h1>
  <p>{data.current.q}</p>
  <ul>
    {#each data.current.items as item (item.id)}
      <li>{item.label}</li>
    {/each}
  </ul>
</main>
