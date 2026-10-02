<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import BoomError from '../components/BoomError.svelte'

  export const Route = createFileRoute('/boom/$id')({
    loader: ({ params }) => {
      throw new Error(`boom-${params.id}`)
    },
    errorComponent: BoomError,
  })
</script>
