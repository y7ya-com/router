<script module lang="ts">
  import { redirect, createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/redirect/$target/via-loader')({
    loaderDeps: ({ search: { reloadDocument, externalHost } }) => ({
      reloadDocument,
      externalHost,
    }),
    loader: ({
      params: { target },
      deps: { externalHost, reloadDocument },
    }) => {
      switch (target) {
        case 'internal':
          throw redirect({ to: '/posts', reloadDocument })
        case 'external':
          throw redirect({ href: externalHost })
      }
    },
  })
</script>

<div>{Route.fullPath}</div>
