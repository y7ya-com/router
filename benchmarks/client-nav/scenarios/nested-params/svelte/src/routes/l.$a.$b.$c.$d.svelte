<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { normalizeParam, smallHash } from '../../../shared'

  export const Route = createFileRoute('/l/$a/$b/$c/$d')({
    params: {
      parse: (params) => ({ ...params, d: normalizeParam(params.d) }),
      stringify: (params) => ({ ...params, d: String(params.d) }),
    },
    beforeLoad: ({ params }) => ({ ctxD: smallHash(params.d) }),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
  import Subscriber from '../components/Subscriber.svelte'

  const params = Route.useParams()
</script>

<Subscriber
  use={() =>
    Route.useParams({
      select: (params) => smallHash(params.d),
    })}
/>
<Subscriber
  use={() =>
    Route.useParams({
      select: (params) => smallHash(`${params.d}:2`),
    })}
/>
<Subscriber
  use={() =>
    Route.useRouteContext({
      select: (context) => context.ctxD,
    })}
/>
<Subscriber
  use={() =>
    Route.useRouteContext({
      select: (context) => (context.ctxD * 31 + 7) >>> 0,
    })}
/>
<div data-testid="mid-state">
  {[
    params.current.a,
    params.current.b,
    params.current.c,
    params.current.d,
  ].join('.')}
</div>
<Outlet />
