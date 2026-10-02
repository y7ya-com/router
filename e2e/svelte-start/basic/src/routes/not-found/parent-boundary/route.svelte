<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import ParentBoundaryNotFoundComponent from '~/components/ParentBoundaryNotFoundComponent.svelte'

  export const Route = createFileRoute('/not-found/parent-boundary')({
    loader: () => ({
      parentLoaderData: 'ready',
    }),
    notFoundComponent: ParentBoundaryNotFoundComponent,
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<div>
  <Outlet />
</div>
