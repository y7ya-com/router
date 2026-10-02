<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/p/$a/$b')()
</script>

<script lang="ts">
  import { itemLabel } from '../../../shared'

  const params = Route.useParams()
</script>

<article>
  <h2>{itemLabel(params.current.a, params.current.b)}</h2>
</article>
