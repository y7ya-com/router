<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/specialChars/malformed/$param')({})
</script>

<script lang="ts">
  const params = Route.useParams()
</script>

<div>
  Hello "/specialChars/malformed/$param":{' '}
  <span data-testid={'special-malformed-param'}>
    {params.current.param}
  </span>
</div>
