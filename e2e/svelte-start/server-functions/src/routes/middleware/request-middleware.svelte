<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { serverFn } from './-functions/request-middleware'

  export const Route = createFileRoute('/middleware/request-middleware')({
    loader: () => serverFn(),
  })
</script>

<script lang="ts">
  import type { ServerFnResult } from './-functions/request-middleware'

  const loaderData = Route.useLoaderData()
  let clientData = $state<ServerFnResult | null>(null)
</script>

<div>
  <h2>Request Middleware in combination with server function</h2>
  <br />
  <div>
    <div data-testid="loader-data">
      <h3>Loader Data</h3>
      Request Param:
      <div data-testid="loader-data-request-param">
        {loaderData.current.requestParam}
      </div>
      Request Func:
      <div data-testid="loader-data-request-func">
        {loaderData.current.requestFunc}
      </div>
    </div>
    <br />
    <div data-testid="client-call">
      <button
        data-testid="client-call-button"
        onclick={async () => {
          const data = await serverFn()
          clientData = data
        }}
      >
        Call server function from client
      </button>
    </div>
    <br />
    <div data-testid="client-data-container">
      <h3>Client Data</h3>
      {#if clientData}
        <div data-testid="client-data">
          Request Param:
          <div data-testid="client-data-request-param">
            {clientData.requestParam}
          </div>
          Request Func:
          <div data-testid="client-data-request-func">
            {clientData.requestFunc}
          </div>
        </div>
      {:else}
        Loading ...
      {/if}
    </div>
  </div>
</div>
