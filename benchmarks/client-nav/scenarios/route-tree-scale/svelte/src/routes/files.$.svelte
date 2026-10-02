<script lang="ts">
  import { getRouteApi } from '@tanstack/svelte-router'

  const params = getRouteApi('/files/$').useParams()
</script>

<div data-testid="scale-state">{`files:${params.current._splat}`}</div>
