<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import z from 'zod'

  export const Route = createFileRoute('/specialChars/search')({
    validateSearch: z.object({
      searchParam: z.string(),
    }),
  })
</script>

<script lang="ts">
  const search = Route.useSearch()
</script>

<div>
  Hello "/specialChars/search"!
  <span data-testid={'special-search-param'}>
    {search.current.searchParam}
  </span>
</div>
