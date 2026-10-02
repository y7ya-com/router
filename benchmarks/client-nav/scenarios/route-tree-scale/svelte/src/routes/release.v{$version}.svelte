<script lang="ts">
  import { getRouteApi } from '@tanstack/svelte-router'

  const params = getRouteApi('/release/v{$version}').useParams()
</script>

<div data-testid="scale-state">{`release:${params.current.version}`}</div>
