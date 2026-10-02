<script lang="ts">
  import type { NotFoundRouteProps } from '@tanstack/svelte-router'

  // Declared so the component is assignable to `notFoundComponent`.
  let _props: NotFoundRouteProps = $props()
</script>

<div data-testid="not-found-state">missing not found</div>
