<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { queryOptions } from '@tanstack/svelte-query'
  import { z } from 'zod'

  const searchSchema = z.object({
    n: z.number().default(1),
  })

  const doubleQueryOptions = (n: number) =>
    queryOptions({
      queryKey: ['transition-double', n],
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return { n, double: n * 2 }
      },
      placeholderData: (oldData) => oldData,
    })

  export const Route = createFileRoute('/transition/count/query')({
    validateSearch: searchSchema,
    loader: ({ context: { queryClient }, location }) => {
      const { n } = searchSchema.parse(location.search)
      return queryClient.ensureQueryData(doubleQueryOptions(n))
    },
  })
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
  import { createQuery } from '@tanstack/svelte-query'

  const search = Route.useSearch()
  const doubleQuery = createQuery(() =>
    doubleQueryOptions(search.current?.n ?? 1),
  )
</script>

<div class="p-2">
  <Link
    data-testid="increase-button"
    class="border bg-gray-50 px-3 py-1"
    from="/transition/count/query"
    search={(s) => ({ n: s.n + 1 })}
  >
    Increase
  </Link>

  <div class="mt-2">
    <div data-testid="n-value">n: {doubleQuery.data?.n}</div>
    <div data-testid="double-value">
      double: {doubleQuery.data?.double}
    </div>
  </div>
</div>
