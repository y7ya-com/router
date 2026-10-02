<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { serverFn } from './-functions/client-middleware-router'

  export const Route = createFileRoute('/middleware/client-middleware-router')({
    loader: async () => ({ serverFnLoaderResult: await serverFn() }),
  })
</script>

<script lang="ts">
  import { useRouter } from '@tanstack/svelte-router'

  let serverFnClientResult = $state<unknown>({})
  const loaderData = Route.useLoaderData()
  const router = useRouter()
</script>

<div
  class="p-2 m-2 grid gap-2"
  data-testid="client-middleware-router-route-component"
>
  <h3>Client Middleware has access to router instance</h3>
  <p>
    This component checks that the client middleware has access to the router
    instance and thus its context.
  </p>
  <div>
    It should return
    <code>
      <pre data-testid="expected-server-fn-result">{JSON.stringify(
          router.options.context,
        )}</pre>
    </code>
  </div>
  <p>
    serverFn when invoked in the loader returns:
    <br />
    <span data-testid="serverFn-loader-result">
      {JSON.stringify(serverFnClientResult)}
    </span>
  </p>
  <p>
    serverFn when invoked on the client returns:
    <br />
    <span data-testid="serverFn-client-result">
      {JSON.stringify(loaderData.current.serverFnLoaderResult)}
    </span>
  </p>
  <button
    data-testid="btn-serverFn"
    type="button"
    class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
    onclick={() => {
      serverFn().then((data) => {
        serverFnClientResult = data
      })
    }}
  >
    Invoke Server Function
  </button>
</div>
