<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
</script>

<div style="padding: .5rem; display: flex; gap: .5rem; font-size: 1.125rem; border-bottom: 1px solid #ccc;">
  <Link to="/" activeOptions={{ exact: true }}>Home</Link>
  <Link to="/posts">Posts</Link>
</div>

<Outlet />
