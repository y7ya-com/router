<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { z } from 'zod'

  export const Route = createFileRoute('/(tests)/with-search')({
    validateSearch: z.object({ where: z.string() }),
  })
</script>

<script lang="ts">
  import ScrollBlock from '../-components/scroll-block.svelte'
</script>

<div class="p-2">
  <h3>page-with-search</h3>
  <hr />
  <ScrollBlock />
</div>
