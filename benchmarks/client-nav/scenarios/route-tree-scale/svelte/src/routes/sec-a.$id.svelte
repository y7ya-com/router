<script lang="ts">
  import { getRouteApi } from '@tanstack/svelte-router'

  const params = getRouteApi('/sec-a/$id').useParams()
</script>

<div data-testid="scale-state">{`sec-a:${params.current.id}`}</div>
