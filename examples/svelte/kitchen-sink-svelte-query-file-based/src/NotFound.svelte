<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
  import type { NotFoundRouteProps } from '@tanstack/svelte-router'

  // Declaring the route-component props keeps this assignable to
  // `defaultNotFoundComponent`'s type, and `routeId` tells us where it fired.
  let { routeId }: NotFoundRouteProps = $props()
</script>

<div class="page">
  <h1>404 · Not found</h1>
  <p>
    Nothing matched under <code>{routeId}</code>. A loader can trigger this by
    throwing <code>notFound()</code> — that's how <code>/posts/9999</code> lands
    here while keeping the Posts layout mounted (<code>notFoundMode: 'fuzzy'</code>).
  </p>
  <p><Link to="/">← Home</Link></p>
</div>

<style>
  .page {
    padding: 1.5rem;
    max-width: 640px;
    color: #4b5563;
    line-height: 1.55;
  }
  h1 {
    margin-top: 0;
    color: #111827;
  }
  code {
    background: #f3f4f6;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    font-size: 0.9em;
    color: #be123c;
  }
</style>
