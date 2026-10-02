<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { RawStream } from '@tanstack/svelte-start'
  import { createDelayedStream, encode } from '../../raw-stream-fns'

  export const Route = createFileRoute('/raw-stream/ssr-single')({
    loader: async () => {
      const stream = createDelayedStream(
        [encode('ssr-chunk1'), encode('ssr-chunk2'), encode('ssr-chunk3')],
        50,
      )
      return {
        message: 'SSR Single Stream Test',
        timestamp: Date.now(),
        rawData: new RawStream(stream),
      }
    },
    shouldReload: __TSR_PRERENDER__,
  })
</script>

<script lang="ts">
  import { onMount, untrack } from 'svelte'
  import { useRouter } from '@tanstack/svelte-router'
  import { createStreamConsumer } from '../../raw-stream-fns'

  const loaderData = Route.useLoaderData()
  const router = useRouter()
  let streamContent = $state('')
  let isConsuming = $state(true)
  let error = $state<string | null>(null)

  let consumeRunId = 0
  const consumeRawStream = (
    rawData: ReadableStream<Uint8Array> | RawStream | undefined,
  ) => {
    if (!rawData) {
      return Promise.resolve()
    }
    const consumeStream = createStreamConsumer()
    const currentRun = ++consumeRunId
    isConsuming = true
    error = null
    return consumeStream(rawData)
      .then((content) => {
        if (currentRun !== consumeRunId) {
          return
        }
        streamContent = content
        isConsuming = false
      })
      .catch((err) => {
        if (currentRun !== consumeRunId) {
          return
        }
        error = String(err)
        isConsuming = false
      })
  }

  let lastRawData: ReadableStream<Uint8Array> | RawStream | undefined
  let didInvalidate = false

  $effect(() => {
    const rawData = loaderData.current.rawData
    if (!rawData || rawData === lastRawData) {
      return
    }
    lastRawData = rawData
    untrack(() => {
      void consumeRawStream(rawData)
    })
  })

  onMount(() => {
    if (__TSR_PRERENDER__ && !didInvalidate) {
      didInvalidate = true
      void router.invalidate({
        filter: (match) => match.routeId === Route.id,
      })
    }
  })
</script>

<div class="space-y-4">
  <h2>SSR Single RawStream Test</h2>
  <p class="text-gray-600">
    This route returns a single RawStream from its loader. The stream is
    serialized during SSR using base64 encoding.
  </p>

  <div class="border p-4 rounded">
    <div data-testid="ssr-single-message">
      Message: {loaderData.current.message}
    </div>
    <div data-testid="ssr-single-timestamp">
      Has Timestamp:{' '}
      {typeof loaderData.current.timestamp === 'number' ? 'true' : 'false'}
    </div>
    <div data-testid="ssr-single-stream">
      Stream Content:{error
        ? `Error: ${error}`
        : isConsuming
          ? 'Loading...'
          : streamContent}
    </div>
    <div data-testid="ssr-single-rawdata-type">
      RawData Type: {typeof loaderData.current.rawData} | hasStream:{loaderData
        .current.rawData && 'getReader' in loaderData.current.rawData
        ? 'true'
        : 'false'}
    </div>
    <pre data-testid="ssr-single-result">{JSON.stringify({
        message: loaderData.current.message,
        streamContent,
        isConsuming,
        error,
      })}</pre>
  </div>
</div>
