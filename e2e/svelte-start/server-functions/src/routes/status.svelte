<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/status')()
</script>

<script lang="ts">
  import { useServerFn } from '@tanstack/svelte-start'
  import { helloFn } from './-functions/status'

  const hello = useServerFn(helloFn)
</script>

<div class="p-2">
  <button
    data-testid="invoke-server-fn"
    class="px-4 py-2 bg-blue-500 text-white rounded-md"
    onclick={() => hello()}
  >
    click me
  </button>
</div>
