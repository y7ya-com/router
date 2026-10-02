<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { docsLayoutHead } from '../../../shared'

  export const Route = createFileRoute('/docs')({
    head: docsLayoutHead,
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<section>
  <h2>Docs</h2>
  <Outlet />
</section>
