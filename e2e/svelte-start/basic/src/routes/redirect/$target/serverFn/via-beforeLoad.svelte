<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { throwRedirect } from '~/components/throwRedirect'

  export const Route = createFileRoute(
    '/redirect/$target/serverFn/via-beforeLoad',
  )({
    beforeLoad: ({
      params: { target },
      search: { reloadDocument, externalHost },
    }) => throwRedirect({ data: { target, reloadDocument, externalHost } }),
  })
</script>

<div>{Route.fullPath}</div>
