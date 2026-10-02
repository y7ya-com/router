<script module lang="ts">
  import { notFound, createFileRoute } from '@tanstack/svelte-router'
  import ViaLoaderNotFound from '~/components/ViaLoaderNotFound.svelte'

  export const Route = createFileRoute('/not-found/via-loader')({
    loader: () => {
      throw notFound()
    },
    notFoundComponent: ViaLoaderNotFound,
  })
</script>

<div data-testid="via-loader-route-component" data-server={typeof window}>
  Hello "/not-found/via-loader"!
</div>
