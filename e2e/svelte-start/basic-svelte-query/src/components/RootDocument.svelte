<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
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
    to="/users"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Users
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
    to="/deferred"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Deferred
  </Link>
  <!-- Deliberately unknown route; the cast stands in for `@ts-expect-error`. -->
  <Link to={'/this-route-does-not-exist' as any}>
    This Route Does Not Exist
  </Link>
</div>
<hr />
{@render children()}
<TanStackRouterDevtoolsInProd position="bottom-right" />
