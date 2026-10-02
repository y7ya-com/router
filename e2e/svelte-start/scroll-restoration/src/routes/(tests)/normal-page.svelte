<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/(tests)/normal-page')()
</script>

<script lang="ts">
  import ScrollBlock from '../-components/scroll-block.svelte'
</script>

<div class="p-2">
  <h3>normal-page</h3>
  <hr />
  <ScrollBlock />
</div>
