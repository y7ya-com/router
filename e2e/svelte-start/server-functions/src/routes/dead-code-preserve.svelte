<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/dead-code-preserve')()
</script>

<script lang="ts">
  import {
    readFileServerFn,
    writeFileServerFn,
  } from './-functions/dead-code-preserve'

  let serverFnOutput = $state<number | undefined>(undefined)
</script>

<div class="p-2 m-2 grid gap-2">
  <h3>Dead code test</h3>
  <p>This server function writes to a file as a side effect, then reads it.</p>
  <button
    class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
    data-testid="test-dead-code-fn-call-btn"
    onclick={async () => {
      await writeFileServerFn({ headers: { 'X-Test': 'test' } })
      serverFnOutput = await readFileServerFn()
    }}
  >
    Call Dead Code Fn
  </button>
  <h4>Server output</h4>
  <pre data-testid="dead-code-fn-call-response">{serverFnOutput}</pre>
</div>
