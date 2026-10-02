<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { makeDeferredSectionPayload } from '../../../deferred-section-data'

  const fallbackFlushTicks = 20

  export const Route = createFileRoute('/stream/$id')({
    loader: ({ params }) => ({
      eager: `streaming-peak-eager-${params.id}`,
      deferred0: makeDeferredSection(params.id, 0),
      deferred1: makeDeferredSection(params.id, 1),
      deferred2: makeDeferredSection(params.id, 2),
      deferred3: makeDeferredSection(params.id, 3),
    }),
  })

  // Deferred sections settle strictly after the document has a chance to
  // flush, so fallbacks are emitted before deferred section content.
  // Chained 0ms timers-phase hops give the renderer a deterministic number of
  // full event-loop turns to flush, instead of a wall-clock delay whose margin
  // varies with runner load; distinct hop counts keep section ordering stable.
  function afterFallbackFlush(sectionIndex: number) {
    return new Promise<void>((resolve) => {
      let remaining = fallbackFlushTicks + sectionIndex

      const step = () => {
        remaining -= 1

        if (remaining <= 0) {
          resolve()
          return
        }

        setTimeout(step, 0)
      }

      setTimeout(step, 0)
    })
  }

  function makeDeferredSection(id: string, sectionIndex: number) {
    return afterFallbackFlush(sectionIndex).then(() =>
      makeDeferredSectionPayload(id, sectionIndex),
    )
  }
</script>

<script lang="ts">
  import { Await } from '@tanstack/svelte-router'
  import type { DeferredSectionPayload } from '../../../deferred-section-data'

  const data = Route.useLoaderData()

  const deferredSections = $derived([
    { index: 0, promise: data.current.deferred0 },
    { index: 1, promise: data.current.deferred1 },
    { index: 2, promise: data.current.deferred2 },
    { index: 3, promise: data.current.deferred3 },
  ] as const)
</script>

{#snippet deferredSection(section: DeferredSectionPayload)}
  {@const marker = `streaming-peak-deferred-${section.index}`}
  <section data-bench={marker}>
    <h2>{marker}</h2>
    {#each section.records as record (record.id)}
      <p>{record.value}</p>
    {/each}
  </section>
{/snippet}

<main data-bench="streaming-peak-page">
  <h1>{data.current.eager}</h1>
  {#each deferredSections as { index, promise } (index)}
    <p data-bench={`streaming-peak-fallback-${index}`}>
      streaming-peak-fallback-{index}
    </p>
    <Await {promise}>
      {#snippet children(section)}
        {@render deferredSection(section)}
      {/snippet}
    </Await>
  {/each}
</main>
