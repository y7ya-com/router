<script module lang="ts">
  import { createFileRoute, redirect } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/from/$id')({
    loader: ({ params }) => {
      const { id } = params

      throw redirect({ to: '/target/$id', params: { id } })
    },
  })
</script>
