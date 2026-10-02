<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'
  import { TanStackRouterDevtoolsInProd } from '@tanstack/svelte-router-devtools'
  import type { Snippet } from 'svelte'

  let { children }: { children: Snippet } = $props()
</script>

<div class="p-2 flex gap-2 text-lg">
  <Link
    to="/"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Home
  </Link>
  <Link
    to="/loader-fetchQuery/$type"
    params={{ type: 'sync' }}
    activeProps={{
      class: 'font-bold',
    }}
  >
    fetchQuery (sync)
  </Link>
  <Link
    to="/loader-fetchQuery/$type"
    params={{ type: 'async' }}
    activeProps={{
      class: 'font-bold',
    }}
  >
    fetchQuery (async)
  </Link>
  <Link
    to="/useQuery"
    activeProps={{
      class: 'font-bold',
    }}
  >
    useQuery
  </Link>
</div>
<hr />
{@render children()}
<TanStackRouterDevtoolsInProd position="bottom-right" />
<SvelteQueryDevtools buttonPosition="bottom-left" />
