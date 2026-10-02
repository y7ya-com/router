<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { makeData } from '~/data'
  import ErrorMessage from '~/components/ErrorMessage.svelte'

  export const Route = createFileRoute('/ssr/stream')({
    loader: () => {
      const dataPromise = new Promise<ReturnType<typeof makeData>>((r) =>
        setTimeout(() => r(makeData()), 1000),
      )
      return {
        someString: 'hello world',
        dataPromise,
      }
    },

    errorComponent: ErrorMessage,
  })
</script>

<script lang="ts">
  import { Await } from '@tanstack/svelte-router'
  import RenderData from '~/components/RenderData.svelte'

  const loaderData = Route.useLoaderData()
</script>

<div>
  <h3 data-testid="stream-heading">Stream</h3>
  <div data-testid="some-data">{loaderData.current.someString}</div>
  <Await promise={loaderData.current.dataPromise}>
    {#snippet children(data)}
      <RenderData id="stream" {data} />
    {/snippet}
    {#snippet fallback()}
      <div>Loading...</div>
    {/snippet}
  </Await>
</div>
