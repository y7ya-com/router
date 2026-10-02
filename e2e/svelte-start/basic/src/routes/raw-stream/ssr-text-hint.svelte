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
  const PURE_TEXT_CHUNKS = [
    encode('Hello '),
    encode('World '),
    encode('from SSR!'),
  ]
  const PURE_TEXT_EXPECTED = concatBytes(PURE_TEXT_CHUNKS)

  const MIXED_CHUNKS = [
    encode('Valid text'),
    new Uint8Array([0xff, 0xfe, 0x80, 0x90]), // Invalid UTF-8
    encode(' more text'),
  ]
  const MIXED_EXPECTED = concatBytes(MIXED_CHUNKS)

  // Pure binary data (invalid UTF-8) - must use base64 fallback
  const PURE_BINARY_CHUNKS = [
    new Uint8Array([0xff, 0xfe, 0x00, 0x01, 0x80, 0x90]),
    new Uint8Array([0xa0, 0xb0, 0xc0, 0xd0, 0xe0, 0xf0]),
  ]
  const PURE_BINARY_EXPECTED = concatBytes(PURE_BINARY_CHUNKS)

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

  export const Route = createFileRoute('/raw-stream/ssr-text-hint')({
    loader: async () => {
      // Pure text stream - should use UTF-8 encoding with text hint
      const textStream = createDelayedStream(
        [encode('Hello '), encode('World '), encode('from SSR!')],
        30,
      )

      // Mixed content stream - text hint should use UTF-8 for valid text, base64 for binary
      const mixedStream = createDelayedStream(
        [
          encode('Valid text'),
          new Uint8Array([0xff, 0xfe, 0x80, 0x90]), // Invalid UTF-8
          encode(' more text'),
        ],
        30,
      )

      // Pure binary stream - text hint must fallback to base64 for all chunks
      const pureBinaryStream = createDelayedStream(
        [
          new Uint8Array([0xff, 0xfe, 0x00, 0x01, 0x80, 0x90]),
          new Uint8Array([0xa0, 0xb0, 0xc0, 0xd0, 0xe0, 0xf0]),
        ],
        30,
      )

      return {
        message: 'SSR Text Hint Test',
        pureText: new RawStream(textStream, { hint: 'text' }),
        mixedContent: new RawStream(mixedStream, { hint: 'text' }),
        pureBinary: new RawStream(pureBinaryStream, { hint: 'text' }),
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
  let pureTextMatch = $state<TextMatch | null>(null)
  let mixedMatch = $state<BinaryMatch | null>(null)
  let pureBinaryMatch = $state<BinaryMatch | null>(null)
  let isLoading = $state(true)
  let error = $state<string | null>(null)

  let consumeRunId = 0
  const consumeHintStreams = (
    pureText: ReadableStream<Uint8Array> | RawStream | undefined,
    mixedContent: ReadableStream<Uint8Array> | RawStream | undefined,
    pureBinary: ReadableStream<Uint8Array> | RawStream | undefined,
  ) => {
    if (!pureText || !mixedContent || !pureBinary) {
      return Promise.resolve()
    }
    const currentRun = ++consumeRunId
    isLoading = true
    error = null
    return Promise.all([
      collectBytes(pureText),
      collectBytes(mixedContent),
      collectBytes(pureBinary),
    ])
      .then(([pureBytes, mixedBytes, pureBinaryBytes]) => {
        if (currentRun !== consumeRunId) {
          return
        }
        const pureComp = compareBytes(pureBytes, PURE_TEXT_EXPECTED)
        const decoder = new TextDecoder()
        pureTextMatch = {
          ...pureComp,
          actualLength: pureBytes.length,
          expectedLength: PURE_TEXT_EXPECTED.length,
          asText: decoder.decode(pureBytes),
        }
        const mixedComp = compareBytes(mixedBytes, MIXED_EXPECTED)
        mixedMatch = {
          ...mixedComp,
          actualLength: mixedBytes.length,
          expectedLength: MIXED_EXPECTED.length,
        }
        const pureBinaryComp = compareBytes(
          pureBinaryBytes,
          PURE_BINARY_EXPECTED,
        )
        pureBinaryMatch = {
          ...pureBinaryComp,
          actualLength: pureBinaryBytes.length,
          expectedLength: PURE_BINARY_EXPECTED.length,
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
        ReadableStream<Uint8Array> | RawStream,
      ]
    | undefined
  let didInvalidate = false

  $effect(() => {
    const pureText = loaderData.current.pureText
    const mixedContent = loaderData.current.mixedContent
    const pureBinary = loaderData.current.pureBinary
    if (!pureText || !mixedContent || !pureBinary) {
      return
    }
    if (
      lastStreams &&
      lastStreams[0] === pureText &&
      lastStreams[1] === mixedContent &&
      lastStreams[2] === pureBinary
    ) {
      return
    }
    lastStreams = [pureText, mixedContent, pureBinary]
    untrack(() => {
      void consumeHintStreams(pureText, mixedContent, pureBinary)
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
  <h2>SSR Text Hint Test</h2>
  <p class="text-gray-600">
    This route tests RawStream with hint: 'text' from loader. Text hint
    optimizes for UTF-8 content but falls back to base64 for invalid UTF-8.
  </p>

  <div class="border p-4 rounded">
    <div data-testid="ssr-text-hint-message">
      Message: {loaderData.current.message}
    </div>
    <div data-testid="ssr-text-hint-pure-text">
      Pure Text:{error
        ? `Error: ${error}`
        : isLoading
          ? 'Loading...'
          : pureTextMatch?.asText}
    </div>
    <div data-testid="ssr-text-hint-pure-match">
      Pure Text Bytes Match:{isLoading
        ? 'Loading...'
        : pureTextMatch?.match
          ? 'true'
          : 'false'}
    </div>
    <div data-testid="ssr-text-hint-mixed-match">
      Mixed Content Bytes Match:{isLoading
        ? 'Loading...'
        : mixedMatch?.match
          ? 'true'
          : 'false'}
    </div>
    <div data-testid="ssr-text-hint-pure-binary-match">
      Pure Binary Bytes Match:{isLoading
        ? 'Loading...'
        : pureBinaryMatch?.match
          ? 'true'
          : 'false'}
    </div>
    <pre data-testid="ssr-text-hint-result">{JSON.stringify({
        message: loaderData.current.message,
        pureTextMatch,
        mixedMatch,
        pureBinaryMatch,
        isLoading,
        error,
      })}</pre>
  </div>
</div>
