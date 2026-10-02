<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'

  export const Route = createRootRoute()
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'

  const ids = ['1', '2']
</script>

<nav>
  <Link to="/" data-testid="go-home">Home</Link>
  {#each ids as id (id)}
    <Link to="/slow/$id" params={{ id }} data-testid={`go-slow-${id}`}>
      {`Slow ${id}`}
    </Link>
  {/each}
  {#each ids as id (id)}
    <Link to="/ctx/$id" params={{ id }} data-testid={`go-ctx-${id}`}>
      {`Ctx ${id}`}
    </Link>
  {/each}
  {#each ids as id (id)}
    <Link to="/nested/$id" params={{ id }} data-testid={`go-nested-${id}`}>
      {`Nested ${id}`}
    </Link>
  {/each}
</nav>
<Outlet />
