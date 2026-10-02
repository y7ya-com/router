<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { normalizeParam, smallHash } from '../../../shared'

  export const Route = createFileRoute('/l/$a/$b/$c/$d/$e/$f/$g/$h')({
    params: {
      parse: (params) => ({ ...params, h: normalizeParam(params.h) }),
      stringify: (params) => ({ ...params, h: String(params.h) }),
    },
    beforeLoad: ({ params }) => ({ ctxH: smallHash(params.h) }),
  })
</script>

<script lang="ts">
  import Subscriber from '../components/Subscriber.svelte'

  const params = Route.useParams()
</script>

<Subscriber
  use={() =>
    Route.useParams({
      select: (params) => smallHash(params.h),
    })}
/>
<Subscriber
  use={() =>
    Route.useParams({
      select: (params) => smallHash(`${params.h}:2`),
    })}
/>
<Subscriber
  use={() =>
    Route.useRouteContext({
      select: (context) => context.ctxH,
    })}
/>
<Subscriber
  use={() =>
    Route.useRouteContext({
      select: (context) => (context.ctxH * 31 + 7) >>> 0,
    })}
/>
<div data-testid="leaf-state">
  {[
    params.current.a,
    params.current.b,
    params.current.c,
    params.current.d,
    params.current.e,
    params.current.f,
    params.current.g,
    params.current.h,
  ].join('.')}
</div>
