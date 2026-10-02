<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { sleep } from '../../utils/posts'

  export const Route = createFileRoute('/(tests)/with-loader')({
    loader: async () => {
      await sleep(1000)
      return { foo: 'bar' }
    },
  })
</script>

<script lang="ts">
  import ScrollBlock from '../-components/scroll-block.svelte'
</script>

<div class="p-2">
  <h3>lazy-with-loader-page</h3>
  <hr />
  <ScrollBlock />
</div>
