<script lang="ts">
  import { ClientOnly, Link, useRouterState } from '@tanstack/svelte-router'
  import type { Snippet } from 'svelte'

  let { children }: { children: Snippet } = $props()

  const routerState = useRouterState({
    select: (state) => ({
      isLoading: state.isLoading,
      status: state.status,
    }),
  })
</script>

<div class="p-2 flex gap-2 text-lg">
  <h1>Selective SSR E2E Test</h1>
  <Link to="/" activeProps={{ class: 'font-bold' }}>Home</Link>
</div>
<hr />
<ClientOnly>
  <div>
    router isLoading:
    <b data-testid="router-isLoading">
      {routerState.current.isLoading ? 'true' : 'false'}
    </b>
  </div>
  <div>
    router status:
    <b data-testid="router-status">{routerState.current.status}</b>
  </div>
</ClientOnly>
<hr />
{@render children()}
