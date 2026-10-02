<script module lang="ts">
  import { createFileRoute, redirect } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/redirect/throw-it')({
    beforeLoad: () => {
      throw redirect({
        to: '/posts/$postId',
        params: { postId: '1' },
      })
    },
  })
</script>
