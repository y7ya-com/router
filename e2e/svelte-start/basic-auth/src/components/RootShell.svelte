<script lang="ts">
  import { Link, useRouteContext } from '@tanstack/svelte-router'
  import { TanStackRouterDevtools } from '@tanstack/svelte-router-devtools'
  import type { Snippet } from 'svelte'

  let { children }: { children: Snippet } = $props()

  const routeContext = useRouteContext({ from: '__root__' })
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
  </Link>
  <div class="ml-auto">
    {#if routeContext.current.user}
      <span class="mr-2">{routeContext.current.user.email}</span>
      <Link to="/logout">Logout</Link>
    {:else}
      <Link to="/login">Login</Link>
    {/if}
  </div>
</div>
<hr />
{@render children()}
<TanStackRouterDevtools position="bottom-right" />
