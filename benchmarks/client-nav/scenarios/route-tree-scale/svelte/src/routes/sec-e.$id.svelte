<script lang="ts">
  import { getRouteApi } from '@tanstack/svelte-router'

  const params = getRouteApi('/sec-e/$id').useParams()
</script>

<div data-testid="scale-state">{`sec-e:${params.current.id}`}</div>
