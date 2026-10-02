<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/server-function/custom-error')()
</script>

<script lang="ts">
  import { CustomError } from '~/CustomError'
  import { serverFnThrowing } from './-functions/serverFnThrowing'

  let validResponse = $state<any>(null)
  let invalidResponse = $state<CustomError | null>(null)
</script>

<div>
  <button
    data-testid="server-function-valid-input"
    onclick={() =>
      serverFnThrowing({ data: { hello: 'world' } }).then(
        (res) => (validResponse = res),
      )}
  >
    trigger valid input
  </button>
  <div data-testid="server-function-valid-response">
    {JSON.stringify(validResponse)}
  </div>

  <br />
  <button
    data-testid="server-function-invalid-input"
    onclick={() =>
      serverFnThrowing({ data: { hello: 'error' } }).catch((err) => {
        if (err instanceof CustomError) {
          invalidResponse = err
        } else {
          throw new Error('expected CustomError')
        }
      })}
  >
    trigger invalid input
  </button>
  <div data-testid="server-function-invalid-response">
    {invalidResponse
      ? JSON.stringify({
          message: invalidResponse.message,
          foo: invalidResponse.foo,
          bar: invalidResponse.bar.toString(),
        })
      : JSON.stringify(invalidResponse)}
  </div>
</div>
