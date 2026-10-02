<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/p/$a')()
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
  import { sectionLabel } from '../../../shared'

  const params = Route.useParams()
</script>

<section>
  <h1>{sectionLabel(params.current.a)}</h1>
  <Outlet />
</section>
