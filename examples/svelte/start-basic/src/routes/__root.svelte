<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'
  import ErrorPanel from '../components/ErrorPanel.svelte'
  import NotFound from '../components/NotFound.svelte'

  export const Route = createRootRoute({
    head: () => ({
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title: 'TanStack Start · Svelte' },
      ],
    }),
    errorComponent: ErrorPanel,
    notFoundComponent: NotFound,
  })
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
</script>

<nav>
  <Link
    to="/"
    activeProps={{ class: 'active' }}
    activeOptions={{ exact: true }}
  >
    Home
  </Link>
  <Link to="/posts" activeProps={{ class: 'active' }}>Posts</Link>
  <!-- A path outside the route tree, to show the not-found component. -->
  <Link
    to={'/this-route-does-not-exist' as any}
    activeProps={{ class: 'active' }}
  >
    This Route Does Not Exist
  </Link>
</nav>
<hr />
<Outlet />

<style>
  :global(body) {
    font-family: system-ui, sans-serif;
    margin: 0;
    padding: 1rem;
    background: #fff;
    color: #1f2937;
  }
  nav {
    display: flex;
    gap: 1rem;
  }
  :global(a) {
    color: #2563eb;
    text-decoration: none;
  }
  :global(a.active) {
    font-weight: 700;
    color: #111827;
  }
  hr {
    border: 0;
    border-top: 1px solid #e5e7eb;
    margin: 1rem 0;
  }
</style>
