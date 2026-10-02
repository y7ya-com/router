<script lang="ts">
  import { getRouteApi } from '@tanstack/svelte-router'

  const params = getRouteApi('/sec-c/$id').useParams()
</script>

<div data-testid="scale-state">{`sec-c:${params.current.id}`}</div>
