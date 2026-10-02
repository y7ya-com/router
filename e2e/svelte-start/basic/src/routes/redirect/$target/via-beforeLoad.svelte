<script module lang="ts">
  import { redirect, createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/redirect/$target/via-beforeLoad')({
    beforeLoad: ({
      params: { target },
      search: { reloadDocument, externalHost },
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
