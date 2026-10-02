<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { blogContext } from '../../../shared'

  export const Route = createFileRoute('/blog')({
    beforeLoad: () => blogContext(),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<section>
  <h2>Blog</h2>
  <Outlet />
</section>
