<script lang="ts">
  import { Link, Outlet, useRouterState } from '../../src'
  import { _testState } from './shared.svelte'

  useRouterState({ select: _testState.select })
</script>

<Link to="/">Back</Link>
<Link to="/posts">Posts</Link>
<Outlet />
