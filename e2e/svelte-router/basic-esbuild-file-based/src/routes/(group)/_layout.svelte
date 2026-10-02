<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/(group)/_layout')({})
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<div>
  <div>Layout inside group</div>
  <Outlet />
</div>
