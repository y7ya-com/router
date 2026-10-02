<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute(
    '/redirect/$target/serverFn/via-useServerFn',
  )({})
</script>

<script lang="ts">
  import RedirectOnClick from '~/components/RedirectOnClick.svelte'

  const params = Route.useParams()
  const search = Route.useSearch()
</script>

<RedirectOnClick
  target={params.current.target}
  reloadDocument={search.current.reloadDocument}
  externalHost={search.current.externalHost}
/>
