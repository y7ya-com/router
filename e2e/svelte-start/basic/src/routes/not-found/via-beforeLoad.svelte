<script module lang="ts">
  import { notFound, createFileRoute } from '@tanstack/svelte-router'
  import ViaBeforeLoadNotFound from '~/components/ViaBeforeLoadNotFound.svelte'

  export const Route = createFileRoute('/not-found/via-beforeLoad')({
    beforeLoad: () => {
      throw notFound()
    },
    notFoundComponent: ViaBeforeLoadNotFound,
  })
</script>

<div data-testid="via-beforeLoad-route-component">
  Hello "/not-found/via-beforeLoad"!
</div>
