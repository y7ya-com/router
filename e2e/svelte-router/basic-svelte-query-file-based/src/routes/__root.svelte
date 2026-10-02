<script module lang="ts">
  import { createRootRouteWithContext } from '@tanstack/svelte-router'
  import type { QueryClient } from '@tanstack/svelte-query'
  import NotFoundComponent from '../components/NotFoundComponent.svelte'

  export const Route = createRootRouteWithContext<{
    queryClient: QueryClient
  }>()({
    notFoundComponent: NotFoundComponent,
  })
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
  import { TanStackRouterDevtools } from '@tanstack/svelte-router-devtools'
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'
</script>

<div class="p-2 flex gap-2 text-lg">
  <Link
    to="/"
    activeProps={{
      class: 'font-bold',
    }}
    activeOptions={{ exact: true }}
  >
    Home
  </Link>
  <Link
    to="/posts"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Posts
  </Link>
  <Link
    to="/layout-a"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Layout
  </Link>
  <!-- Deliberately unknown route; the cast stands in for `@ts-expect-error`. -->
  <Link
    to={'/this-route-does-not-exist' as any}
    activeProps={{
      class: 'font-bold',
    }}
  >
    This Route Does Not Exist
  </Link>
</div>
<hr />
<Outlet />
<SvelteQueryDevtools buttonPosition="top-right" />
<TanStackRouterDevtools position="bottom-right" />
