<script lang="ts">
  import { useMatch, useParams } from '@tanstack/svelte-router'

  const match = useMatch({ strict: false })
  const params = useParams({ strict: false })
  const title = $derived(match.current?.staticData.title ?? '')
</script>

<div>
  <h3>{title}</h3>
  <div data-testid="params-output">{JSON.stringify(params.current)}</div>
</div>
