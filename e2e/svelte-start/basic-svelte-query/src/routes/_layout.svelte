<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/_layout')({})
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<div class="p-2">
  <div>I'm a layout</div>
  <div>
    <Outlet />
  </div>
</div>
