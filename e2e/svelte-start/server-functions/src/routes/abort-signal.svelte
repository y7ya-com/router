<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/abort-signal')()
</script>

<script lang="ts">
  import { abortableServerFn } from './-functions/abort-signal'

  let errorMessage = $state<string | undefined>(undefined)
  let result = $state<string | undefined>(undefined)

  const reset = () => {
    errorMessage = undefined
    result = undefined
  }
</script>

<div>
  <button
    data-testid="run-with-abort-btn"
    onclick={async () => {
      reset()
      const controller = new AbortController()
      const serverFnPromise = abortableServerFn({
        signal: controller.signal,
      })
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 500))
      await timeoutPromise
      controller.abort()
      try {
        const serverFnResult = await serverFnPromise
        result = serverFnResult
      } catch (error) {
        errorMessage = (error as any).message
      }
    }}
  >
    call server function with abort signal
  </button>
  <br />
  <button
    data-testid="run-without-abort-btn"
    onclick={async () => {
      reset()
      const serverFnResult = await abortableServerFn()
      result = serverFnResult
    }}
  >
    call server function
  </button>
  <div class="p-2">
    result: <p data-testid="result">{result ?? '$undefined'}</p>
  </div>
  <div class="p-2">
    message:
    <p data-testid="errorMessage">{errorMessage ?? '$undefined'}</p>
  </div>
</div>
