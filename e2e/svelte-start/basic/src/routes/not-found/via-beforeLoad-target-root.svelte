<script module lang="ts">
  import {
    createFileRoute,
    notFound,
    rootRouteId,
  } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/not-found/via-beforeLoad-target-root')(
    {
      beforeLoad: () => {
        throw notFound({ routeId: rootRouteId })
      },
    },
  )
</script>

<div data-testid="via-beforeLoad-target-root-route-component">
  Hello "/not-found/via-beforeLoad-target-root"!
</div>
