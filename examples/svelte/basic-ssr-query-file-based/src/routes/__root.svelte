<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
</script>

<nav>
  <Link to="/" activeProps={{ class: 'active' }} activeOptions={{ exact: true }}>
    Home
  </Link>
  <Link to="/posts" activeProps={{ class: 'active' }}>Posts</Link>
</nav>
<hr />
<Outlet />

<style>
  :global(body) {
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      Segoe UI,
      sans-serif;
    margin: 0;
    padding: 1.25rem;
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
