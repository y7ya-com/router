<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { createServerFn } from '@tanstack/svelte-start'
  import {
    deferredDataDelay,
    deferredDataMessage,
    deferredImmediateName,
    deferredServerDelay,
    deferredSlowName,
    delay,
    makeDeferredMessage,
    makeServerData,
    sourceMarker,
  } from '../../../../streaming-ssr-fixtures'

  const getImmediateData = createServerFn({ method: 'GET' })
    .validator((data: { name: string }) => data)
    .handler(({ data }) => makeServerData(data.name))

  const getSlowData = createServerFn({ method: 'GET' })
    .validator((data: { name: string; delay: number }) => data)
    .handler(async ({ data }) => {
      await delay(data.delay)
      return makeServerData(data.name)
    })

  export const Route = createFileRoute('/deferred')({
    loader: async () => {
      return {
        deferredData: makeDeferredMessage(
          deferredDataMessage,
          deferredDataDelay,
        ),
        deferredServerData: getSlowData({
          data: { name: deferredSlowName, delay: deferredServerDelay },
        }),
        immediateData: await getImmediateData({
          data: { name: deferredImmediateName },
        }),
        loaderSource: sourceMarker(),
      }
    },
  })
</script>

<script lang="ts">
  import { Await } from '@tanstack/svelte-router'

  const data = Route.useLoaderData()
</script>

<div style="padding: 20px">
  <h2>Deferred Data Test</h2>
  <div data-testid="immediate-data">
    Immediate: {data.current.immediateData.name} @{' '}
    {data.current.immediateData.timestamp}
  </div>
  <div data-testid="immediate-source">
    Immediate source: {data.current.immediateData.source}
  </div>
  <div data-testid="loader-source">
    Loader source: {data.current.loaderSource}
  </div>
  <Await promise={data.current.deferredData}>
    {#snippet children(value)}
      <div data-testid="deferred-data">
        {value.message} (source: {value.source})
      </div>
    {/snippet}
    {#snippet fallback()}
      <div data-testid="deferred-loading">Loading deferred...</div>
    {/snippet}
  </Await>
  <Await promise={data.current.deferredServerData}>
    {#snippet children(value)}
      <div data-testid="deferred-server-data">
        Server: {value.name} @ {value.timestamp} (source:{' '}
        {value.source})
      </div>
    {/snippet}
    {#snippet fallback()}
      <div data-testid="server-loading">Loading server data...</div>
    {/snippet}
  </Await>
</div>
