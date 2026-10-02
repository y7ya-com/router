<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { RawStream } from '@tanstack/svelte-start'
  import { createDelayedStream, encode } from '../../raw-stream-fns'

  export const Route = createFileRoute('/raw-stream/ssr-multiple')({
    loader: async () => {
      const stream1 = createDelayedStream(
        [encode('multi-1a'), encode('multi-1b')],
        30,
      )
      const stream2 = createDelayedStream(
        [encode('multi-2a'), encode('multi-2b')],
        50,
      )
      return {
        message: 'SSR Multiple Streams Test',
        first: new RawStream(stream1),
        second: new RawStream(stream2),
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
  let firstContent = $state('')
  let secondContent = $state('')
  let isConsuming = $state(true)
  let error = $state<string | null>(null)

  let consumeRunId = 0
  const consumeRawStreams = (
    first: ReadableStream<Uint8Array> | RawStream | undefined,
    second: ReadableStream<Uint8Array> | RawStream | undefined,
  ) => {
    if (!first || !second) {
      return Promise.resolve()
    }
    const consumeStream = createStreamConsumer()
    const currentRun = ++consumeRunId
    isConsuming = true
    error = null
    return Promise.all([consumeStream(first), consumeStream(second)])
      .then(([content1, content2]) => {
        if (currentRun !== consumeRunId) {
          return
        }
        firstContent = content1
        secondContent = content2
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

  let lastStreams:
    | [
        ReadableStream<Uint8Array> | RawStream,
        ReadableStream<Uint8Array> | RawStream,
      ]
    | undefined
  let didInvalidate = false

  $effect(() => {
    const first = loaderData.current.first
    const second = loaderData.current.second
    if (!first || !second) {
      return
    }
    if (lastStreams && lastStreams[0] === first && lastStreams[1] === second) {
      return
    }
    lastStreams = [first, second]
    untrack(() => {
      void consumeRawStreams(first, second)
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
  <h2>SSR Multiple RawStreams Test</h2>
  <p class="text-gray-600">
    This route returns multiple RawStreams from its loader. Each stream is
    independently serialized during SSR.
  </p>

  <div class="border p-4 rounded">
    <div data-testid="ssr-multiple-message">
      Message: {loaderData.current.message}
    </div>
    <div data-testid="ssr-multiple-first">
      First Stream:{error
        ? `Error: ${error}`
        : isConsuming
          ? 'Loading...'
          : firstContent}
    </div>
    <div data-testid="ssr-multiple-second">
      Second Stream:{error
        ? `Error: ${error}`
        : isConsuming
          ? 'Loading...'
          : secondContent}
    </div>
    <pre data-testid="ssr-multiple-result">{JSON.stringify({
        message: loaderData.current.message,
        firstContent,
        secondContent,
        isConsuming,
        error,
      })}</pre>
  </div>
</div>
