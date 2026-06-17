<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
</script>

<div class="page">
  <h1>About</h1>
  <p>
    This example is part of the experimental Svelte 5 port of TanStack Router.
    The Query integration mirrors <code>@tanstack/react-router-ssr-query</code>
    and <code>@tanstack/solid-router-ssr-query</code>, built on the shared
    <code>@tanstack/router-ssr-query-core</code>.
  </p>
  <p><Link to="/">← Home</Link></p>
</div>

<style>
  .page {
    padding: 1.5rem;
    max-width: 640px;
    line-height: 1.6;
  }
  h1 {
    margin-top: 0;
  }
  code {
    background: #f3f4f6;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    font-size: 0.9em;
  }
</style>
