<script module lang="ts">
  import { createFileRoute, notFound } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/missing/$id')({
    loader: () => {
      throw notFound()
    },
  })
</script>
