<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { normalizeParam, smallHash } from '../../../shared'

  export const Route = createFileRoute('/l/$a/$b/$c/$d/$e/$f')({
    params: {
      parse: (params) => ({ ...params, f: normalizeParam(params.f) }),
      stringify: (params) => ({ ...params, f: String(params.f) }),
    },
    beforeLoad: ({ params }) => ({ ctxF: smallHash(params.f) }),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
  import Subscriber from '../components/Subscriber.svelte'
</script>

<Subscriber
  use={() =>
    Route.useParams({
      select: (params) => smallHash(params.f),
    })}
/>
<Subscriber
  use={() =>
    Route.useParams({
      select: (params) => smallHash(`${params.f}:2`),
    })}
/>
<Subscriber
  use={() =>
    Route.useRouteContext({
      select: (context) => context.ctxF,
    })}
/>
<Subscriber
  use={() =>
    Route.useRouteContext({
      select: (context) => (context.ctxF * 31 + 7) >>> 0,
    })}
/>
<Outlet />
