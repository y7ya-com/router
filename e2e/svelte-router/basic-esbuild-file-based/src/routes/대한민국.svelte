<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/대한민국')({})
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<div>
  <h3 class="pb-2" data-testid="unicode-heading">Hello "/대한민국"!</h3>
  <hr />
  <Outlet />
</div>
