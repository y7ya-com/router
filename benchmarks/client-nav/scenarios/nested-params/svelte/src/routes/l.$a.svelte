<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { normalizeParam, smallHash } from '../../../shared'

  export const Route = createFileRoute('/l/$a')({
    params: {
      parse: (params) => ({ ...params, a: normalizeParam(params.a) }),
      stringify: (params) => ({ ...params, a: String(params.a) }),
    },
    beforeLoad: ({ params }) => ({ ctxA: smallHash(params.a) }),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
  import Subscriber from '../components/Subscriber.svelte'
</script>

<Subscriber
  use={() =>
    Route.useParams({
      select: (params) => smallHash(params.a),
    })}
/>
<Subscriber
  use={() =>
    Route.useParams({
      select: (params) => smallHash(`${params.a}:2`),
    })}
/>
<Subscriber
  use={() =>
    Route.useRouteContext({
      select: (context) => context.ctxA,
    })}
/>
<Subscriber
  use={() =>
    Route.useRouteContext({
      select: (context) => (context.ctxA * 31 + 7) >>> 0,
    })}
/>
<Outlet />
