<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { RawStream } from '@tanstack/svelte-start'
  import {
    collectBytes,
    compareBytes,
    concatBytes,
    createDelayedStream,
    encode,
  } from '../../raw-stream-fns'

  // Expected data - defined at module level for client-side verification
  const TEXT_CHUNKS = [encode('Binary '), encode('hint '), encode('with text')]
  const TEXT_EXPECTED = concatBytes(TEXT_CHUNKS)

  const BINARY_CHUNKS = [
    new Uint8Array([0x00, 0x01, 0x02, 0x03]),
    new Uint8Array([0xff, 0xfe, 0xfd, 0xfc]),
  ]
  const BINARY_EXPECTED = concatBytes(BINARY_CHUNKS)

  type TextMatch = {
    match: boolean
    mismatchIndex: number | null
    actualLength: number
    expectedLength: number
    asText: string
  }

  type BinaryMatch = {
    match: boolean
    mismatchIndex: number | null
    actualLength: number
    expectedLength: number
  }

  export const Route = createFileRoute('/raw-stream/ssr-binary-hint')({
    loader: async () => {
      // Text data with binary hint - should still use base64 (default behavior)
      const textStream = createDelayedStream(
        [encode('Binary '), encode('hint '), encode('with text')],
        30,
      )

      // Pure binary stream with binary hint
      const binaryStream = createDelayedStream(
        [
          new Uint8Array([0x00, 0x01, 0x02, 0x03]),
          new Uint8Array([0xff, 0xfe, 0xfd, 0xfc]),
        ],
        30,
      )

      return {
        message: 'SSR Binary Hint Test',
        textData: new RawStream(textStream, { hint: 'binary' }),
        binaryData: new RawStream(binaryStream, { hint: 'binary' }),
      }
    },
    shouldReload: __TSR_PRERENDER__,
  })
</script>

<script lang="ts">
  import { onMount, untrack } from 'svelte'
  import { useRouter } from '@tanstack/svelte-router'

  const loaderData = Route.useLoaderData()
  const router = useRouter()
  let textMatch = $state<TextMatch | null>(null)
  let binaryMatch = $state<BinaryMatch | null>(null)
  let isLoading = $state(true)
  let error = $state<string | null>(null)

  let consumeRunId = 0
  const consumeHintStreams = (
    textData: ReadableStream<Uint8Array> | RawStream | undefined,
    binaryData: ReadableStream<Uint8Array> | RawStream | undefined,
  ) => {
    if (!textData || !binaryData) {
      return Promise.resolve()
    }
    const currentRun = ++consumeRunId
    isLoading = true
    error = null
    return Promise.all([collectBytes(textData), collectBytes(binaryData)])
      .then(([textBytes, binaryBytes]) => {
        if (currentRun !== consumeRunId) {
          return
        }
        const textComp = compareBytes(textBytes, TEXT_EXPECTED)
        const decoder = new TextDecoder()
        textMatch = {
          ...textComp,
          actualLength: textBytes.length,
          expectedLength: TEXT_EXPECTED.length,
          asText: decoder.decode(textBytes),
        }
        const binaryComp = compareBytes(binaryBytes, BINARY_EXPECTED)
        binaryMatch = {
          ...binaryComp,
          actualLength: binaryBytes.length,
          expectedLength: BINARY_EXPECTED.length,
        }
        isLoading = false
      })
      .catch((err) => {
        if (currentRun !== consumeRunId) {
          return
        }
        error = String(err)
        isLoading = false
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
    const textData = loaderData.current.textData
    const binaryData = loaderData.current.binaryData
    if (!textData || !binaryData) {
      return
    }
    if (
      lastStreams &&
      lastStreams[0] === textData &&
      lastStreams[1] === binaryData
    ) {
      return
    }
    lastStreams = [textData, binaryData]
    untrack(() => {
      void consumeHintStreams(textData, binaryData)
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
  <h2>SSR Binary Hint Test</h2>
  <p class="text-gray-600">
    This route tests RawStream with hint: 'binary' from loader. Binary hint
    always uses base64 encoding (default behavior).
  </p>

  <div class="border p-4 rounded">
    <div data-testid="ssr-binary-hint-message">
      Message: {loaderData.current.message}
    </div>
    <div data-testid="ssr-binary-hint-text">
      Text Data:{error
        ? `Error: ${error}`
        : isLoading
          ? 'Loading...'
          : textMatch?.asText}
    </div>
    <div data-testid="ssr-binary-hint-text-match">
      Text Bytes Match:{isLoading
        ? 'Loading...'
        : textMatch?.match
          ? 'true'
          : 'false'}
    </div>
    <div data-testid="ssr-binary-hint-binary-match">
      Binary Bytes Match:{isLoading
        ? 'Loading...'
        : binaryMatch?.match
          ? 'true'
          : 'false'}
    </div>
    <pre data-testid="ssr-binary-hint-result">{JSON.stringify({
        message: loaderData.current.message,
        textMatch,
        binaryMatch,
        isLoading,
        error,
      })}</pre>
  </div>
</div>
