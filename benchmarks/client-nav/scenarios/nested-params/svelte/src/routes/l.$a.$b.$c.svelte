<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { normalizeParam, smallHash } from '../../../shared'

  export const Route = createFileRoute('/l/$a/$b/$c')({
    params: {
      parse: (params) => ({ ...params, c: normalizeParam(params.c) }),
      stringify: (params) => ({ ...params, c: String(params.c) }),
    },
    beforeLoad: ({ params }) => ({ ctxC: smallHash(params.c) }),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
  import Subscriber from '../components/Subscriber.svelte'
</script>

<Subscriber
  use={() =>
    Route.useParams({
      select: (params) => smallHash(params.c),
    })}
/>
<Subscriber
  use={() =>
    Route.useParams({
      select: (params) => smallHash(`${params.c}:2`),
    })}
/>
<Subscriber
  use={() =>
    Route.useRouteContext({
      select: (context) => context.ctxC,
    })}
/>
<Subscriber
  use={() =>
    Route.useRouteContext({
      select: (context) => (context.ctxC * 31 + 7) >>> 0,
    })}
/>
<Outlet />
