<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { createServerFn } from '@tanstack/svelte-start'
  import {
    fastSerialStaticData,
    makeFastSerialSmallData,
    sourceMarker,
  } from '../../../../streaming-ssr-fixtures'

  const getSmallData = createServerFn({ method: 'GET' }).handler(() =>
    makeFastSerialSmallData(),
  )

  export const Route = createFileRoute('/fast-serial')({
    loader: async () => {
      const data = await getSmallData()
      return {
        serverData: data,
        staticData: fastSerialStaticData,
        timestamp: Date.now(),
        loaderSource: sourceMarker(),
      }
    },
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<div style="padding: 20px">
  <h2>Fast Serialization Test</h2>
  <p>This route tests when serialization completes before render.</p>
  <div data-testid="server-data">
    Server: {data.current.serverData.value} @{' '}
    {data.current.serverData.timestamp}
  </div>
  <div data-testid="server-fn-source">
    Server function source: {data.current.serverData.source}
  </div>
  <div data-testid="loader-source">
    Loader source: {data.current.loaderSource}
  </div>
  <div data-testid="static-data">Static: {data.current.staticData}</div>
  <div data-testid="loader-timestamp">
    Loader timestamp: {data.current.timestamp}
  </div>
</div>
