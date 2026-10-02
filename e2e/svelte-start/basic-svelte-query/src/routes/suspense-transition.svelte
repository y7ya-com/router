<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { queryOptions } from '@tanstack/svelte-query'

  const doubleQueryOptions = (n: number) =>
    queryOptions({
      queryKey: ['double', n],
      queryFn: async () => {
        // Add a delay to make the transition observable
        await new Promise((r) => setTimeout(r, 500))
        return n * 2
      },
      placeholderData: (previousData) => previousData,
    })

  export const Route = createFileRoute('/suspense-transition')({
    validateSearch: (search: { n?: number }) => ({ n: search.n ?? 1 }),
    ssr: false, // Disable SSR to avoid suspense issues during initial load
  })
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
  import { createQuery } from '@tanstack/svelte-query'

  const search = Route.useSearch()
  const doubleQuery = createQuery(() =>
    doubleQueryOptions(search.current?.n ?? 1),
  )
  let displayedN = $state(search.current?.n ?? 1)
  let displayedDouble = $state<number | undefined>(undefined)

  $effect(() => {
    if (doubleQuery.data !== undefined) {
      displayedN = search.current?.n ?? displayedN
      displayedDouble = doubleQuery.data
    }
  })
</script>

<div class="p-2">
  <h1 data-testid="suspense-transition-title">Suspense Transition Test</h1>

  <div class="flex gap-2 my-4">
    <Link
      data-testid="increase-button"
      class="border bg-gray-50 px-3 py-1"
      from="/suspense-transition"
      search={(s) => ({ n: s.n + 1 })}
    >
      Increase
    </Link>
  </div>

  <div class="mt-2 border p-4">
    <div data-testid="suspense-fallback" style="display: none;">Loading...</div>
    <div data-testid="suspense-content">
      <div>
        n: <span data-testid="n-value">{displayedN}</span>
      </div>
      <div>
        double:
        <span data-testid="double-value">{displayedDouble}</span>
      </div>
    </div>
  </div>
</div>
