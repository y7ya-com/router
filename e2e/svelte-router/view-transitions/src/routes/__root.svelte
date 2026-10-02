<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'
  import RootNotFound from './-components/RootNotFound.svelte'

  export const Route = createRootRoute({
    notFoundComponent: RootNotFound,
  })
</script>

<script lang="ts">
  import { HeadContent, Link, Outlet } from '@tanstack/svelte-router'
  import { TanStackRouterDevtools } from '@tanstack/svelte-router-devtools'
</script>

<HeadContent />
<div class="p-2 flex gap-2 text-lg border-b">
  <Link
    to="/"
    activeProps={{
      class: 'font-bold',
    }}
    activeOptions={{ exact: true }}
    viewTransition
  >
    Home
  </Link>
  <Link
    to="/posts"
    activeProps={{
      class: 'font-bold',
    }}
    viewTransition
  >
    Posts
  </Link>
</div>
<hr />
<Outlet />
<!-- Start rendering router matches -->
<TanStackRouterDevtools position="bottom-right" />
