<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/merge-middleware-context')()
</script>

<script lang="ts">
  let apiResponse = $state<any>(null)

  const fetchMiddlewareContext = async () => {
    try {
      const response = await fetch('/api/middleware-context')
      const data = await response.json()
      apiResponse = data
    } catch (error) {
      console.error('Error fetching middleware context:', error)
      apiResponse = { error: 'Failed to fetch' }
    }
  }
</script>

<div class="p-2 m-2 grid gap-2">
  <h3>Merge Server Route Middleware Context Test</h3>
  <div class="flex flex-col gap-2">
    <button
      type="button"
      onclick={fetchMiddlewareContext}
      data-testid="test-middleware-context-btn"
      class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
    >
      Test Middleware Context
    </button>

    {#if apiResponse}
      <div class="mt-4">
        <h4>API Response:</h4>
        <pre
          data-testid="api-response"
          class="bg-gray-100 p-2 rounded-sm text-black">{JSON.stringify(
            apiResponse,
            null,
            2,
          )}</pre>

        <div class="mt-4 grid gap-2">
          <h4>Context Verification:</h4>
          <div
            data-testid="context-result"
            class="bg-gray-100 p-2 rounded-sm text-black"
          >
            {JSON.stringify(apiResponse?.context, null, 2)}
          </div>

          <div data-testid="has-test-parent" class="p-2 border rounded-sm">
            Has testParent:
            {apiResponse?.context?.testParent ? 'true' : 'false'}
          </div>

          <div data-testid="has-test" class="p-2 border rounded-sm">
            Has test: {apiResponse?.context?.test ? 'true' : 'false'}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
