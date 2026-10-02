<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/methods')()
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<div class="p-8">
  <h1 class="font-bold text-lg">Server Routes Methods E2E tests</h1>
  <Outlet />
</div>
