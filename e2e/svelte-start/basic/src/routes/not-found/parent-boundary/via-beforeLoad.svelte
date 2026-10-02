<script module lang="ts">
  import { createFileRoute, notFound } from '@tanstack/svelte-router'
  import { Route as ParentBoundaryRoute } from './route.svelte'

  export const Route = createFileRoute(
    '/not-found/parent-boundary/via-beforeLoad',
  )({
    beforeLoad: () => {
      throw notFound({ routeId: ParentBoundaryRoute.id })
    },
  })
</script>

<div data-testid="parent-boundary-child-route-component">
  Hello "/not-found/parent-boundary/via-beforeLoad"!
</div>
