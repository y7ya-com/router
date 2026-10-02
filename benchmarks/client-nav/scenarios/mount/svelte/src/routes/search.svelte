<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { normalizePage, normalizeQuery } from '../../../shared'

  export const Route = createFileRoute('/search')({
    validateSearch: (search: Record<string, unknown>) => ({
      q: normalizeQuery(search.q),
      page: normalizePage(search.page),
    }),
  })
</script>

<script lang="ts">
  const search = Route.useSearch()
</script>

<p>{`Results for "${search.current.q}" page ${search.current.page}`}</p>
