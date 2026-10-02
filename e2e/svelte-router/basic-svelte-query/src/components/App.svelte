<script lang="ts">
  import { RouterProvider } from '@tanstack/svelte-router'
  import { QueryClientProvider } from '@tanstack/svelte-query'
  import type { AnyRouter } from '@tanstack/svelte-router'
  import type { QueryClient } from '@tanstack/svelte-query'

  let { router, queryClient }: { router: AnyRouter; queryClient: QueryClient } =
    $props()
</script>

<QueryClientProvider client={queryClient}>
  <RouterProvider {router} />
</QueryClientProvider>
