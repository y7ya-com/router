<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import {
    createChunkStream,
    createStreamPromise,
  } from '../../../../streaming-ssr-fixtures'

  export const Route = createFileRoute('/stream')({
    loader() {
      return {
        promise: createStreamPromise(),
        stream: createChunkStream(),
      }
    },
  })

  const decoder = new TextDecoder('utf-8')
</script>

<script lang="ts">
  import { onMount, untrack } from 'svelte'
  import { Await, useRouter } from '@tanstack/svelte-router'

  const data = Route.useLoaderData()
  const router = useRouter()
  let streamData = $state<Array<string>>([])
  let streamComplete = $state(false)
  let streamReadCount = $state(0)
  let reader: ReadableStreamDefaultReader | undefined
  let mounted = false
  let activeStream: ReadableStream | undefined
  let reading = false
  let readTimer: ReturnType<typeof setTimeout> | undefined

  function clearReadTimer() {
    if (readTimer) {
      clearTimeout(readTimer)
      readTimer = undefined
    }
  }

  function scheduleRead(delay = 0) {
    if (!mounted || reading) {
      return
    }

    clearReadTimer()
    readTimer = setTimeout(() => {
      readTimer = undefined
      void readStream()
    }, delay)
  }

  async function readStream() {
    const stream = data.current.stream
    if (!mounted || reading || activeStream === stream) {
      return
    }

    if (stream.locked) {
      scheduleRead(10)
      return
    }

    streamData = []
    streamComplete = false

    let activeReader: ReadableStreamDefaultReader | undefined

    try {
      const currentReader = stream.getReader()
      activeReader = currentReader
      reader = currentReader
      activeStream = stream
      reading = true
      streamReadCount++

      let chunk
      while (!(chunk = await currentReader.read()).done) {
        let value = chunk.value
        if (typeof value !== 'string') {
          value = decoder.decode(value, { stream: !chunk.done })
        }
        streamData = [...streamData, value]
      }
      streamComplete = true
    } catch (e) {
      const message = String(e)
      if (e instanceof TypeError && message.includes('locked')) {
        activeStream = undefined
        scheduleRead(10)
      } else if (!(e instanceof TypeError && message.includes('cancelled'))) {
        console.error('Stream error:', e)
      }
    } finally {
      activeReader?.releaseLock()
      if (reader === activeReader) {
        reader = undefined
      }
      reading = false
      if (activeStream !== data.current.stream) {
        scheduleRead()
      }
    }
  }

  onMount(() => {
    mounted = true
    scheduleRead()
    return () => {
      mounted = false
      clearReadTimer()
      reader?.cancel().catch(() => {})
      reader = undefined
    }
  })

  let watchedStream: ReadableStream | undefined
  $effect(() => {
    const stream = data.current.stream
    untrack(() => {
      if (watchedStream !== undefined && watchedStream !== stream) {
        activeStream = undefined
        scheduleRead()
      }
      watchedStream = stream
    })
  })
</script>

<div style="padding: 20px">
  <h2>ReadableStream Test</h2>
  <button data-testid="refresh-stream" onclick={() => router.invalidate()}>
    Refresh stream
  </button>
  <Await promise={data.current.promise}>
    {#snippet children(value)}
      <div data-testid="promise-data">{value}</div>
    {/snippet}
    {#snippet fallback()}
      <div data-testid="promise-loading">Loading promise...</div>
    {/snippet}
  </Await>
  <div data-testid="stream-container">
    <h3>Stream chunks:</h3>
    <div data-testid="stream-data" data-read-count={streamReadCount}>
      {#each streamData as chunk, i (i)}
        <div data-testid={`stream-chunk-${i}`}>{chunk}</div>
      {/each}
    </div>
    {#if streamComplete}
      <div data-testid="stream-complete">Stream complete!</div>
    {/if}
  </div>
</div>
