<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { getTestHeaders } from './-functions/headers'

  export const Route = createFileRoute('/headers')({
    loader: async () => {
      return {
        testHeaders: await getTestHeaders(),
      }
    },
  })
</script>

<script lang="ts">
  import type { RequestHeaderName } from '@tanstack/svelte-start/server'

  type TestHeadersResult = {
    headers?: Partial<Record<RequestHeaderName, string | undefined>>
    serverHeaders?: Partial<Record<RequestHeaderName, string | undefined>>
  }

  const loaderData = Route.useLoaderData()
  let testHeadersResult = $state<TestHeadersResult | null>(null)
</script>

<div class="p-2 m-2 grid gap-2">
  <h3>Headers Test</h3>
  <form
    class="flex flex-col gap-2"
    data-testid="serialize-formdata-form"
    onsubmit={(evt) => {
      evt.preventDefault()
      getTestHeaders().then((data) => {
        testHeadersResult = data
      })
    }}
  >
    <button
      type="submit"
      data-testid="test-headers-btn"
      class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
    >
      Get Headers
    </button>
  </form>
  <div class="overflow-y-auto">
    <h4>Initial Headers:</h4>
    <pre data-testid="initial-headers-result">{JSON.stringify(
        loaderData.current.testHeaders.headers,
        null,
        2,
      )}</pre>
    {#if testHeadersResult}
      <h4>Updated Headers:</h4>
      <pre data-testid="updated-headers-result">{JSON.stringify(
          testHeadersResult.headers,
          null,
          2,
        )}</pre>
    {/if}
  </div>
</div>
