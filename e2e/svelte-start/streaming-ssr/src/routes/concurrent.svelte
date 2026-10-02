<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { createConcurrentLoaderData } from '../../../../streaming-ssr-fixtures'

  export const Route = createFileRoute('/concurrent')({
    loader: async () => createConcurrentLoaderData(),
  })
</script>

<script lang="ts">
  import ConcurrentPromiseItem from '~/components/ConcurrentPromiseItem.svelte'

  const data = Route.useLoaderData()
</script>

<div style="padding: 20px">
  <h2>Concurrent Resolution Test (15 promises in 3 batches)</h2>
  <p>Tests multiple promises resolving at the exact same instant.</p>
  <ConcurrentPromiseItem
    promise={data.current.concurrent1_1}
    testId="concurrent-1-1"
  />
  <ConcurrentPromiseItem
    promise={data.current.concurrent1_2}
    testId="concurrent-1-2"
  />
  <ConcurrentPromiseItem
    promise={data.current.concurrent1_3}
    testId="concurrent-1-3"
  />
  <ConcurrentPromiseItem
    promise={data.current.concurrent1_4}
    testId="concurrent-1-4"
  />
  <ConcurrentPromiseItem
    promise={data.current.concurrent1_5}
    testId="concurrent-1-5"
  />
  <ConcurrentPromiseItem
    promise={data.current.concurrent2_1}
    testId="concurrent-2-1"
  />
  <ConcurrentPromiseItem
    promise={data.current.concurrent2_2}
    testId="concurrent-2-2"
  />
  <ConcurrentPromiseItem
    promise={data.current.concurrent2_3}
    testId="concurrent-2-3"
  />
  <ConcurrentPromiseItem
    promise={data.current.concurrent2_4}
    testId="concurrent-2-4"
  />
  <ConcurrentPromiseItem
    promise={data.current.concurrent2_5}
    testId="concurrent-2-5"
  />
  <ConcurrentPromiseItem
    promise={data.current.concurrent3_1}
    testId="concurrent-3-1"
  />
  <ConcurrentPromiseItem
    promise={data.current.concurrent3_2}
    testId="concurrent-3-2"
  />
  <ConcurrentPromiseItem
    promise={data.current.concurrent3_3}
    testId="concurrent-3-3"
  />
  <ConcurrentPromiseItem
    promise={data.current.concurrent3_4}
    testId="concurrent-3-4"
  />
  <ConcurrentPromiseItem
    promise={data.current.concurrent3_5}
    testId="concurrent-3-5"
  />
</div>
