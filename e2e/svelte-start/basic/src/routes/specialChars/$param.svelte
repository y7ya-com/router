<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/specialChars/$param')({})
</script>

<script lang="ts">
  const params = Route.useParams()
</script>

<div>
  Hello "/specialChars/$param":{' '}
  <span data-testid={'special-param'}>{params.current.param}</span>
</div>
