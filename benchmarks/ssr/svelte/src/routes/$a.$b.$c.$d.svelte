<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/$a/$b/$c/$d')({})
</script>

<script lang="ts">
  import RouteWorkload from '../workload/RouteWorkload.svelte'
</script>

<RouteWorkload />
