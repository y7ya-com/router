<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { createServerFn } from '@tanstack/svelte-start'
  import {
    makeDeferredMessage,
    makeServerData,
    slowRenderComponents,
    slowRenderDeferredDelay,
    slowRenderDeferredMessage,
    slowRenderQuickName,
    sourceMarker,
  } from '../../../../streaming-ssr-fixtures'

  const getQuickData = createServerFn({ method: 'GET' }).handler(() =>
    makeServerData(slowRenderQuickName),
  )

  export const Route = createFileRoute('/slow-render')({
    loader: async () => {
      const quickData = await getQuickData()
      return {
        quickData,
        deferredData: makeDeferredMessage(
          slowRenderDeferredMessage,
          slowRenderDeferredDelay,
        ),
        loaderSource: sourceMarker(),
      }
    },
  })
</script>

<script lang="ts">
  import { Await } from '@tanstack/svelte-router'
  import SlowComponent from '~/components/SlowComponent.svelte'

  const data = Route.useLoaderData()
</script>

<div style="padding: 20px">
  <h2>Slow Render Test</h2>
  <p>Tests when render takes longer than serialization.</p>
  <div data-testid="quick-data">
    Quick: {data.current.quickData.name} @ {data.current.quickData.timestamp}
  </div>
  <div data-testid="quick-source">
    Quick data source: {data.current.quickData.source}
  </div>
  <div data-testid="loader-source">
    Loader source: {data.current.loaderSource}
  </div>
  <Await promise={data.current.deferredData}>
    {#snippet children(value)}
      <div data-testid="deferred-resolved">
        {value.message} (source: {value.source})
      </div>
    {/snippet}
    {#snippet fallback()}
      <div data-testid="deferred-loading">Loading...</div>
    {/snippet}
  </Await>
  {#each slowRenderComponents as slowData, index (index)}
    <SlowComponent data={slowData} index={index + 1} />
  {/each}
</div>
