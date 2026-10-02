<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/classic/hello')({})
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
</script>

<div>
  Hello!
  <br />
  <Link
    to="/classic/hello/universe"
    activeProps={{
      class: 'font-bold',
    }}
  >
    say hello to the universe
  </Link>
  <Link
    to="/classic/hello/world"
    activeProps={{
      class: 'font-bold',
    }}
  >
    say hello to the world
  </Link>
  <Outlet />
</div>
