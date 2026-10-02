<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'
  import RootNotFound from '~/components/RootNotFound.svelte'
  import appCss from '~/styles/app.css?url'

  export const Route = createRootRoute({
    notFoundComponent: RootNotFound,
    head: () => {
      return {
        links: [{ rel: 'stylesheet', href: appCss }],
      }
    },
  })
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
  import { TanStackRouterDevtools } from '@tanstack/svelte-router-devtools'
</script>

<div class="p-2 flex gap-2 text-lg border-b">
  <Link
    to="/"
    activeProps={{
      class: 'font-bold',
    }}
    activeOptions={{ exact: true }}
  >
    Home
  </Link>{' '}
  <Link
    to="/posts"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Posts
  </Link>{' '}
  <Link
    to="/route-without-file/layout-a"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Layout
  </Link>{' '}
  <Link
    to="/classic/hello"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Subtree
  </Link>{' '}
  <Link
    data-testid="special-pipe-link"
    to="/special|pipe"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Pipe
  </Link>{' '}
  <!-- intentionally not a registered route -->
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
<TanStackRouterDevtools position="bottom-right" />
