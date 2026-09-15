<script lang="ts">
  import { getRouteApi } from '@tanstack/svelte-router'

  const postRouteApi = getRouteApi('/posts/$postId')
  const post = postRouteApi.useLoaderData()
</script>

<div style="display: flex; flex-direction: column; gap: .5rem;">
  <h4 style="font-size: 1.25rem; font-weight: bold;">{post.current.title}</h4>
  <hr style="opacity: .2;" />
  <div style="font-size: .875rem;">{post.current.body}</div>
</div>
