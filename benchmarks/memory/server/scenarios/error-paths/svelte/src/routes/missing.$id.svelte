<script module lang="ts">
  import { createFileRoute, notFound } from '@tanstack/svelte-router'
  import MissingNotFound from '../components/MissingNotFound.svelte'

  export const Route = createFileRoute('/missing/$id')({
    loader: () => {
      throw notFound()
    },
    notFoundComponent: MissingNotFound,
  })
</script>
