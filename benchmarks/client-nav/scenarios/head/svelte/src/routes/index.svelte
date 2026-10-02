<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { homeHead } from '../../../shared'

  export const Route = createFileRoute('/')({
    head: homeHead,
  })
</script>

<script lang="ts">
  import { homeTitle } from '../../../shared'
</script>

<main>
  <h1>{homeTitle}</h1>
  <p>Landing page</p>
</main>
