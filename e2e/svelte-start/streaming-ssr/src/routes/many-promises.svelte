<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { createManyPromises } from '../../../../streaming-ssr-fixtures'

  export const Route = createFileRoute('/many-promises')({
    loader: async () => createManyPromises(),
  })
</script>

<script lang="ts">
  import PromiseItem from '~/components/PromiseItem.svelte'

  const data = Route.useLoaderData()
</script>

<div style="padding: 20px">
  <h2>Many Promises Test (15 deferred)</h2>
  <p>Tests streaming with many concurrent deferred promises.</p>
  <PromiseItem
    promise={data.current.immediate1}
    testId="immediate-1"
    label="Immediate 1"
  />
  <PromiseItem
    promise={data.current.immediate2}
    testId="immediate-2"
    label="Immediate 2"
  />
  <PromiseItem
    promise={data.current.immediate3}
    testId="immediate-3"
    label="Immediate 3"
  />
  <PromiseItem promise={data.current.fast1} testId="fast-1" label="Fast 1" />
  <PromiseItem promise={data.current.fast2} testId="fast-2" label="Fast 2" />
  <PromiseItem promise={data.current.fast3} testId="fast-3" label="Fast 3" />
  <PromiseItem promise={data.current.fast4} testId="fast-4" label="Fast 4" />
  <PromiseItem
    promise={data.current.medium1}
    testId="medium-1"
    label="Medium 1"
  />
  <PromiseItem
    promise={data.current.medium2}
    testId="medium-2"
    label="Medium 2"
  />
  <PromiseItem
    promise={data.current.medium3}
    testId="medium-3"
    label="Medium 3"
  />
  <PromiseItem promise={data.current.slow1} testId="slow-1" label="Slow 1" />
  <PromiseItem promise={data.current.slow2} testId="slow-2" label="Slow 2" />
  <PromiseItem promise={data.current.slow3} testId="slow-3" label="Slow 3" />
  <PromiseItem
    promise={data.current.verySlow1}
    testId="very-slow-1"
    label="Very Slow 1"
  />
  <PromiseItem
    promise={data.current.verySlow2}
    testId="very-slow-2"
    label="Very Slow 2"
  />
</div>
