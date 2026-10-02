<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { RawStream } from '@tanstack/svelte-start'
  import { createDelayedStream, encode } from '../../raw-stream-fns'

  export const Route = createFileRoute('/raw-stream/ssr-mixed')({
    loader: () => {
      const rawStream = createDelayedStream(
        [encode('mixed-ssr-1'), encode('mixed-ssr-2')],
        50,
      )

      // Deferred promise that resolves after a delay
      const deferredData = new Promise<string>((resolve) =>
        setTimeout(() => resolve('deferred-ssr-value'), 100),
      )

      return {
        immediate: 'immediate-ssr-value',
        deferred: deferredData,
        rawData: new RawStream(rawStream),
      }
    },
    shouldReload: __TSR_PRERENDER__,
  })
</script>

<script lang="ts">
  import { onMount, untrack } from 'svelte'
  import { Await, useRouter } from '@tanstack/svelte-router'
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
  <h2>SSR Mixed Streaming Test</h2>
  <p class="text-gray-600">
    This route returns a mix of immediate data, deferred promises, and RawStream
    from its loader.
  </p>

  <div class="border p-4 rounded">
    <div data-testid="ssr-mixed-immediate">
      Immediate: {loaderData.current.immediate}
    </div>
    <div data-testid="ssr-mixed-deferred">
      Deferred:<Await promise={loaderData.current.deferred}>
        {#snippet children(value)}
          <span>{value}</span>
        {/snippet}
        {#snippet fallback()}
          <span>Loading deferred...</span>
        {/snippet}
      </Await>
    </div>
    <div data-testid="ssr-mixed-stream">
      Stream Content:{error
        ? `Error: ${error}`
        : isConsuming
          ? 'Loading...'
          : streamContent}
    </div>
    <pre data-testid="ssr-mixed-result">{JSON.stringify({
        immediate: loaderData.current.immediate,
        streamContent,
        isConsuming,
        error,
      })}</pre>
  </div>
</div>
