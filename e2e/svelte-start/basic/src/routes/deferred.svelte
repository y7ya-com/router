<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { personServerFn, slowServerFn } from '~/utils/deferred'

  export const Route = createFileRoute('/deferred')({
    loader: async () => {
      return {
        deferredStuff: new Promise<string>((r) =>
          setTimeout(() => r('Hello deferred!'), 2000),
        ),
        deferredPerson: slowServerFn({ data: { name: 'Tanner Linsley' } }),
        person: await personServerFn({ data: { name: 'John Doe' } }),
      }
    },
  })
</script>

<script lang="ts">
  import { Await } from '@tanstack/svelte-router'

  let count = $state(0)
  const loaderData = Route.useLoaderData()
</script>

<div class="p-2">
  <div data-testid="regular-person">
    {loaderData.current.person.name} - {loaderData.current.person.randomNumber}
  </div>
  <Await promise={loaderData.current.deferredPerson}>
    {#snippet children(data)}
      <div data-testid="deferred-person">
        {data.name} - {data.randomNumber}
      </div>
    {/snippet}
    {#snippet fallback()}
      <div>Loading person...</div>
    {/snippet}
  </Await>
  <Await promise={loaderData.current.deferredStuff}>
    {#snippet children(data)}
      <h3 data-testid="deferred-stuff">{data}</h3>
    {/snippet}
    {#snippet fallback()}
      <div>Loading stuff...</div>
    {/snippet}
  </Await>
  <div data-testid="count">Count: {count}</div>
  <div>
    <button data-testid="increment" onclick={() => count++}> Increment </button>
  </div>
</div>
