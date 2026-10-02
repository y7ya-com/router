<script module lang="ts">
  export interface TestCase {
    fn: () => Promise<any>
    expected: any
  }
</script>

<script lang="ts">
  import { deepEqual } from '@tanstack/svelte-router'

  let { fn, expected }: TestCase = $props()

  let result = $state<null | unknown>(null)
  const comparison = $derived.by(() => {
    if (result) {
      const isEqual = deepEqual(result, expected)
      return isEqual ? 'equal' : 'not equal'
    }
    return 'Loading...'
  })
</script>

<div
  data-testid={`test-${expected.name}`}
  class="p-2 border border-gray-200 rounded-md"
>
  <div>
    It should return
    <code>
      <pre data-testid={`expected-fn-result-${expected.name}`}>{JSON.stringify(
          expected,
        )}</pre>
    </code>
  </div>
  <p>
    fn returns:
    <br />
    <span data-testid={`fn-result-${expected.name}`}>
      {result ? JSON.stringify(result) : 'Loading...'}
    </span>
    <span data-testid={`fn-comparison-${expected.name}`}>
      {comparison}
    </span>
  </p>
  <button
    data-testid={`btn-fn-${expected.name}`}
    type="button"
    class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
    onclick={() => {
      fn().then((data) => {
        result = data
      })
    }}
  >
    Invoke Server Function
  </button>
</div>
