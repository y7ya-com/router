<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'

  export const Route = createRootRoute({
    head: () => ({
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title: 'TanStack Start Manifest Bloat E2E' },
      ],
    }),
  })
</script>

<script lang="ts">
  import AppShell from '~/components/AppShell.svelte'
</script>

<AppShell />
