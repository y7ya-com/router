<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import type { BeforeLoadContext } from '../../../shared'

  export const Route = createFileRoute('/$a/$b')({
    beforeLoad: ({ params, context }) => {
      const parent = context as BeforeLoadContext

      return {
        chainToken: `${parent.chainToken}.${params.b}`,
        ctxB: params.b,
      }
    },
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<Outlet />
