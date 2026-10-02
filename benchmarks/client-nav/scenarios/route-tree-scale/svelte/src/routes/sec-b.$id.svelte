<script lang="ts">
  import { getRouteApi } from '@tanstack/svelte-router'

  const params = getRouteApi('/sec-b/$id').useParams()
</script>

<div data-testid="scale-state">{`sec-b:${params.current.id}`}</div>
