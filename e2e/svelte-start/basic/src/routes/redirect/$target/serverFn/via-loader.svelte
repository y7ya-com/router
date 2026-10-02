<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { throwRedirect } from '~/components/throwRedirect'

  export const Route = createFileRoute('/redirect/$target/serverFn/via-loader')(
    {
      loaderDeps: ({ search: { reloadDocument, externalHost } }) => ({
        reloadDocument,
        externalHost,
      }),
      loader: ({
        params: { target },
        deps: { reloadDocument, externalHost },
      }) => throwRedirect({ data: { target, reloadDocument, externalHost } }),
    },
  )
</script>

<div>{Route.fullPath}</div>
