<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
  import { TanStackRouterDevtools } from '@tanstack/svelte-router-devtools'
</script>

<div class="p-2 flex gap-2 text-lg border-b">
  <Link
    to="/"
    activeProps={{
      class: 'font-bold',
    }}
    activeOptions={{ exact: true }}
  >
    Home
  </Link>
</div>
<Outlet />
<TanStackRouterDevtools position="bottom-right" />
