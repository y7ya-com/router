<script>
  import { Outlet } from '@tanstack/svelte-router'
</script>

<div class="p-2">
  <div class="border-b">I'm a pathless layout</div>
  <div>
    <Outlet />
  </div>
</div>
