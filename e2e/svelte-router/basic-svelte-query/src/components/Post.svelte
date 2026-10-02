<script lang="ts">
  import { useLoaderData, useParams } from '@tanstack/svelte-router'
  import { createQuery } from '@tanstack/svelte-query'
  import { postQueryOptions } from '../posts'

  const params = useParams({ from: '/posts/$postId' })
  createQuery(() => postQueryOptions(params.current?.postId ?? ''))
  const post = useLoaderData({ from: '/posts/$postId' })
</script>

<div class="space-y-2">
  <h4 class="text-xl font-bold underline">{post.current?.title}</h4>
  <div class="text-sm">{post.current?.body}</div>
</div>
