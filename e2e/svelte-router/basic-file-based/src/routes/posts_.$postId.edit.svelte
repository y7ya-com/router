<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/posts_/$postId/edit')({})
</script>

<script lang="ts">
  import { useParams, getRouteApi } from '@tanstack/svelte-router'

  const api = getRouteApi('/posts_/$postId/edit')

  const paramsViaApi = api.useParams()
  const paramsViaHook = useParams({ from: '/posts_/$postId/edit' })
  const paramsViaRouteHook = Route.useParams()
</script>

<div>
  <div data-testid="params-via-hook">{paramsViaHook.current.postId}</div>
  <div data-testid="params-via-route-hook">
    {paramsViaRouteHook.current.postId}
  </div>
  <div data-testid="params-via-route-api">{paramsViaApi.current.postId}</div>
</div>
