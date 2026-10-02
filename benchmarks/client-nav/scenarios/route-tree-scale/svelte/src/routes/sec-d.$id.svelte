<script lang="ts">
  import { getRouteApi } from '@tanstack/svelte-router'

  const params = getRouteApi('/sec-d/$id').useParams()
</script>

<div data-testid="scale-state">{`sec-d:${params.current.id}`}</div>
