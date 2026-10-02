<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { normalizeParam, smallHash } from '../../../shared'

  export const Route = createFileRoute('/l/$a/$b')({
    params: {
      parse: (params) => ({ ...params, b: normalizeParam(params.b) }),
      stringify: (params) => ({ ...params, b: String(params.b) }),
    },
    beforeLoad: ({ params }) => ({ ctxB: smallHash(params.b) }),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
  import Subscriber from '../components/Subscriber.svelte'
</script>

<Subscriber
  use={() =>
    Route.useParams({
      select: (params) => smallHash(params.b),
    })}
/>
<Subscriber
  use={() =>
    Route.useParams({
      select: (params) => smallHash(`${params.b}:2`),
    })}
/>
<Subscriber
  use={() =>
    Route.useRouteContext({
      select: (context) => context.ctxB,
    })}
/>
<Subscriber
  use={() =>
    Route.useRouteContext({
      select: (context) => (context.ctxB * 31 + 7) >>> 0,
    })}
/>
<Outlet />
