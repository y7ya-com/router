<script lang="ts">
  import { QueryClientProvider } from '@tanstack/svelte-query'
  import type { QueryClient } from '@tanstack/query-core'
  import Posts from './Posts.svelte'

  let { client }: { client: QueryClient } = $props()
</script>

<QueryClientProvider {client}>
  <Posts />
</QueryClientProvider>
