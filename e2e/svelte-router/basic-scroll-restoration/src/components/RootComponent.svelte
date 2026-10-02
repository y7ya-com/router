<script lang="ts">
  import { HeadContent, Link, Outlet } from '@tanstack/svelte-router'
  import { TanStackRouterDevtools } from '@tanstack/svelte-router-devtools'
</script>

<HeadContent />
<div class="p-2 flex gap-2 sticky top-0 border-b bg-gray-100 dark:bg-gray-900">
  <Link to="/" class="[&.active]:font-bold">Home</Link>
  <Link to="/about" class="[&.active]:font-bold">About</Link>
  <Link to="/about" resetScroll={false}>About (No Reset)</Link>
  <Link to="/by-element" class="[&.active]:font-bold">By-Element</Link>
</div>
<Outlet />
<TanStackRouterDevtools />
