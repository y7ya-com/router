<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { createServerFn } from '@tanstack/svelte-start'
  import {
    delay,
    makeDeferred,
    makeLevelData,
    nestedLevelDelays,
    nestedPlainDelay,
    nestedPlainMessage,
  } from '../../../../streaming-ssr-fixtures'

  const getLevel1Data = createServerFn({ method: 'GET' }).handler(async () => {
    await delay(nestedLevelDelays[0])
    return makeLevelData(1)
  })

  const getLevel2Data = createServerFn({ method: 'GET' }).handler(async () => {
    await delay(nestedLevelDelays[1])
    return makeLevelData(2)
  })

  const getLevel3Data = createServerFn({ method: 'GET' }).handler(async () => {
    await delay(nestedLevelDelays[2])
    return makeLevelData(3)
  })

  export const Route = createFileRoute('/nested-deferred')({
    loader: async () => {
      return {
        level1: getLevel1Data(),
        level2: getLevel2Data(),
        level3: getLevel3Data(),
        plainDeferred: makeDeferred(nestedPlainMessage, nestedPlainDelay),
      }
    },
  })
</script>

<script lang="ts">
  import { Await } from '@tanstack/svelte-router'
  import Level1Content from '~/components/Level1Content.svelte'

  const data = Route.useLoaderData()
</script>

<div style="padding: 20px">
  <h2>Nested Deferred Test</h2>
  <p>Tests multiple nested deferred promises resolving at different times.</p>
  <Await promise={data.current.plainDeferred}>
    {#snippet children(value)}
      <div data-testid="plain-deferred">{value}</div>
    {/snippet}
    {#snippet fallback()}
      <div data-testid="plain-loading">Loading plain...</div>
    {/snippet}
  </Await>
  <div style="margin-top: 20px">
    <Await promise={data.current.level1}>
      {#snippet children(value)}
        <div data-testid="level1-data">
          Level 1: {value.level} @ {value.timestamp}
          <Level1Content
            level2={data.current.level2}
            level3={data.current.level3}
          />
        </div>
      {/snippet}
      {#snippet fallback()}
        <div data-testid="level1-loading">Loading level 1...</div>
      {/snippet}
    </Await>
  </div>
</div>
