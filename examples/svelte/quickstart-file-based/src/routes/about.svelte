<script lang="ts">
  import { useRouter, useRouterState } from '@tanstack/svelte-router'

  const router = useRouter()
  const state = useRouterState()
</script>

<div class="page">
  <h1>About</h1>

  <h2>Router state</h2>
  <pre>{JSON.stringify(
    {
      pathname: state.current.location.pathname,
      search: state.current.location.search,
      status: state.current.status,
      routes: Object.keys(router.routesById),
    },
    null,
    2,
  )}</pre>
</div>

<style>
  .page {
    padding: 1.5rem;
    max-width: 720px;
    line-height: 1.55;
  }
  h2 {
    margin-top: 1.5rem;
  }
  pre {
    background: #f3f4f6;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    overflow: auto;
    font-size: 0.85rem;
  }
</style>
