<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'

  export const Route = createRootRoute()
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
  import LocationMarker from '../components/LocationMarker.svelte'
</script>

<LocationMarker />
<nav>
  <Link to="/" data-testid="home">Home</Link>
  <Link to="/hop1" data-testid="go-hop1">Redirect chain</Link>
  <Link to="/missing/$id" params={{ id: 'exists' }} data-testid="go-missing-ok">
    Missing ok
  </Link>
  <Link to="/missing/$id" params={{ id: 'gone' }} data-testid="go-missing-gone">
    Missing gone
  </Link>
  <Link to="/broken" data-testid="go-broken">Broken</Link>
  <Link to="/target" data-testid="go-target">Target</Link>
</nav>
<Outlet />
