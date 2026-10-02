<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/formdata-redirect/target/$name')()
</script>

<script lang="ts">
  const params = Route.useParams()
</script>

<div data-testid="formdata-redirect-target">
  Hello <span data-testid="formdata-redirect-target-name"
    >{params.current.name}</span
  >!
</div>
