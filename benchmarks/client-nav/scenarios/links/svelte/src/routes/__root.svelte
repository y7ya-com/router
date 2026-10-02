<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'

  export const Route = createRootRoute()
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
  import StatusPanel from '../components/StatusPanel.svelte'
  import LinkGrid from '../components/LinkGrid.svelte'
</script>

<nav>
  <Link to="/" data-testid="go-home">Home</Link>
  <Link to="/about" data-testid="go-about">About</Link>
</nav>
<StatusPanel />
<LinkGrid />
<Outlet />
