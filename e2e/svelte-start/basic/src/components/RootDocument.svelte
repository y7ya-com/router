<script lang="ts">
  import { ClientOnly, Link, useRouterState } from '@tanstack/svelte-router'
  import { TanStackRouterDevtoolsInProd } from '@tanstack/svelte-router-devtools'
  import type { Snippet } from 'svelte'

  let { children }: { children: Snippet } = $props()

  const routerState = useRouterState({
    select: (state) => ({ isLoading: state.isLoading, status: state.status }),
  })
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
    to="/users"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Users
  </Link>{' '}
  <Link
    to="/layout-a"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Layout
  </Link>{' '}
  <Link
    to="/scripts"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Scripts
  </Link>{' '}
  <Link
    to="/inline-scripts"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Inline Scripts
  </Link>{' '}
  <Link
    to="/deferred"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Deferred
  </Link>{' '}
  <Link
    to="/redirect"
    activeProps={{
      class: 'font-bold',
    }}
  >
    redirect
  </Link>{' '}
  <Link
    to="/raw-stream"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Raw Stream
  </Link>{' '}
  <Link
    to={'/this-route-does-not-exist' as any}
    activeProps={{
      class: 'font-bold',
    }}
  >
    This Route Does Not Exist
  </Link>
</div>
<ClientOnly>
  <div hidden>
    <b data-testid="router-isLoading">
      {routerState.current.isLoading ? 'true' : 'false'}
    </b>
    <b data-testid="router-status">{routerState.current.status}</b>
  </div>
</ClientOnly>
{@render children()}
<div class="inline-div">This is an inline styled div</div>
<TanStackRouterDevtoolsInProd />
