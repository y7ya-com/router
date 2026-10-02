<script lang="ts">
  import { getRouteApi } from '@tanstack/svelte-router'

  const params = getRouteApi('/sec-f/$id').useParams()
</script>

<div data-testid="scale-state">{`sec-f:${params.current.id}`}</div>
