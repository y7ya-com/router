<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { makeData } from '~/data'
  import PostsLoading from '~/components/PostsLoading.svelte'

  export const Route = createFileRoute('/ssr/data-only')({
    ssr: 'data-only',
    beforeLoad: () => {
      return makeData()
    },
    loader: ({ context }) => {
      return context
    },
    pendingComponent: PostsLoading,
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
  import RenderData from '~/components/RenderData.svelte'

  const context = Route.useRouteContext()
  const loaderData = Route.useLoaderData()

  const localData = makeData()
  const expectedHonkState = localData.car.singleInstance.honk()
  const honkState = $derived(loaderData.current.car.singleInstance.honk())
</script>

<div data-testid="data-only-container">
  <h2 data-testid="data-only-heading">data-only</h2>
  <div>
    context: <RenderData id="context" data={context.current} />
  </div>
  <div>
    loader: <RenderData id="loader" data={loaderData.current} />
  </div>
  <div data-testid="honk-container">
    <h3>honk</h3>
    <div>
      expected:
      <div data-testid="honk-expected-state">
        {JSON.stringify(expectedHonkState)}
      </div>
    </div>
    <div>
      actual:
      <div data-testid="honk-actual-state">
        {JSON.stringify(honkState)}
      </div>
    </div>
  </div>
  <hr />
  <Outlet />
</div>
