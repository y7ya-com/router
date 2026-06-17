<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  import { postsQueryOptions } from './posts-query'

  // Reads the QueryClient from context — provided by the integration's `Wrap`.
  const query = createQuery(() => postsQueryOptions())
</script>

{#if query.data}
  <p data-testid="posts">{query.data}</p>
{/if}
