<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { settingsHead } from '../../../shared'

  export const Route = createFileRoute('/settings')({
    head: settingsHead,
  })
</script>

<script lang="ts">
  import { settingsTitle } from '../../../shared'
</script>

<main>
  <h1>{settingsTitle}</h1>
  <p>Account settings</p>
</main>
