<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { queryHeavyItems } from '../../../../streaming-ssr-fixtures'
  import { makeQueryOptions } from '~/queryOptions'

  const syncQuery1 = makeQueryOptions(queryHeavyItems[0])
  const syncQuery2 = makeQueryOptions(queryHeavyItems[1])
  const syncQuery3 = makeQueryOptions(queryHeavyItems[2])
  const fastAsyncQuery1 = makeQueryOptions(queryHeavyItems[3])
  const fastAsyncQuery2 = makeQueryOptions(queryHeavyItems[4])
  const fastAsyncQuery3 = makeQueryOptions(queryHeavyItems[5])
  const slowAsyncQuery1 = makeQueryOptions(queryHeavyItems[6])
  const slowAsyncQuery2 = makeQueryOptions(queryHeavyItems[7])
  const slowAsyncQuery3 = makeQueryOptions(queryHeavyItems[8])

  export const Route = createFileRoute('/query-heavy')()
</script>

<script lang="ts">
  import QuerySuspense from '~/components/QuerySuspense.svelte'
</script>

<div style="padding: 20px">
  <h2>Query Heavy Test (9 useQuery calls)</h2>
  <p>Tests multiple useQuery with mixed sync/async queryFn.</p>
  <p>
    All queries should show "source: server" if SSR streaming works correctly.
  </p>

  <div
    style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px"
  >
    <div>
      <h3>Sync Queries (immediate)</h3>
      <QuerySuspense
        queryOpts={syncQuery1}
        testId="sync-query-1"
        fallback="Loading sync 1..."
      />
      <QuerySuspense
        queryOpts={syncQuery2}
        testId="sync-query-2"
        fallback="Loading sync 2..."
      />
      <QuerySuspense
        queryOpts={syncQuery3}
        testId="sync-query-3"
        fallback="Loading sync 3..."
      />
    </div>

    <div>
      <h3>Fast Async Queries (50-100ms)</h3>
      <QuerySuspense
        queryOpts={fastAsyncQuery1}
        testId="fast-async-query-1"
        fallback="Loading fast 1..."
      />
      <QuerySuspense
        queryOpts={fastAsyncQuery2}
        testId="fast-async-query-2"
        fallback="Loading fast 2..."
      />
      <QuerySuspense
        queryOpts={fastAsyncQuery3}
        testId="fast-async-query-3"
        fallback="Loading fast 3..."
      />
    </div>

    <div>
      <h3>Slow Async Queries (200-400ms)</h3>
      <QuerySuspense
        queryOpts={slowAsyncQuery1}
        testId="slow-async-query-1"
        fallback="Loading slow 1..."
      />
      <QuerySuspense
        queryOpts={slowAsyncQuery2}
        testId="slow-async-query-2"
        fallback="Loading slow 2..."
      />
      <QuerySuspense
        queryOpts={slowAsyncQuery3}
        testId="slow-async-query-3"
        fallback="Loading slow 3..."
      />
    </div>
  </div>
</div>
