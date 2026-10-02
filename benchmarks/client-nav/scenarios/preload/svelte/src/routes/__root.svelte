<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'

  export const Route = createRootRoute()
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
  import { sections } from '../../../shared'
</script>

<nav>
  <Link to="/" data-testid="go-home">Home</Link>
  {#each sections as section (section)}
    <Link
      to="/sections/$section"
      params={{ section }}
      data-testid={`s-${section}`}
    >
      {`Section ${section}`}
    </Link>
  {/each}
  <Link to="/docs" data-testid="go-docs">Docs</Link>
</nav>
<Outlet />
