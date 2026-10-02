<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { createServerFn } from '@tanstack/svelte-start'
  import { env } from 'cloudflare:workers'

  export const Route = createFileRoute('/')({
    loader: () => getData(),
  })

  const getData = createServerFn().handler(() => {
    return {
      message: `Running in ${navigator.userAgent}`,
      myVar: env.MY_VAR,
    }
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<div class="p-2">
  <h3>Welcome Home!!!</h3>
  <p data-testid="message">{data.current.message}</p>
  <p data-testid="myVar">{data.current.myVar}</p>
</div>
