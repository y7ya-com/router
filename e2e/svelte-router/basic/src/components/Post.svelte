<script lang="ts">
  import { useLoaderData } from '@tanstack/svelte-router'

  const post = useLoaderData({ from: '/posts/$postId' })
</script>

<div class="space-y-2">
  <h4 class="text-xl font-bold">{post.current?.title}</h4>
  <hr class="opacity-20" />
  <div class="text-sm">{post.current?.body}</div>
</div>
