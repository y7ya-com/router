<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { createServerFn } from '@tanstack/svelte-start'
  import { env } from 'cloudflare:workers'

  export const Route = createFileRoute('/static')({
    loader: () => getData(),
  })

  const getData = createServerFn().handler(() => {
    return {
      myVar: env.MY_VAR,
    }
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<div>
  <h1 data-testid="static-heading">Static Page</h1>
  <p data-testid="static-content">The value is {data.current.myVar}</p>
</div>
