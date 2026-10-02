<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'
  import RootNotFound from '../components/RootNotFound.svelte'

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
  <Link
    to="/classic/hello"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Subtree
  </Link>
  <!-- Deliberately unknown route; the cast stands in for `@ts-expect-error`,
       which Svelte markup cannot carry. -->
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
<!-- Start rendering router matches -->
<TanStackRouterDevtools position="bottom-right" />
