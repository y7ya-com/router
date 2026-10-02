<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { normalizeParam, smallHash } from '../../../shared'

  export const Route = createFileRoute('/l/$a/$b/$c/$d/$e/$f/$g')({
    params: {
      parse: (params) => ({ ...params, g: normalizeParam(params.g) }),
      stringify: (params) => ({ ...params, g: String(params.g) }),
    },
    beforeLoad: ({ params }) => ({ ctxG: smallHash(params.g) }),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
  import Subscriber from '../components/Subscriber.svelte'
</script>

<Subscriber
  use={() =>
    Route.useParams({
      select: (params) => smallHash(params.g),
    })}
/>
<Subscriber
  use={() =>
    Route.useParams({
      select: (params) => smallHash(`${params.g}:2`),
    })}
/>
<Subscriber
  use={() =>
    Route.useRouteContext({
      select: (context) => context.ctxG,
    })}
/>
<Subscriber
  use={() =>
    Route.useRouteContext({
      select: (context) => (context.ctxG * 31 + 7) >>> 0,
    })}
/>
<Outlet />
