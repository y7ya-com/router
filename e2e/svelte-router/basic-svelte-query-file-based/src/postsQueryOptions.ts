import { queryOptions } from '@tanstack/svelte-query'
import { fetchPosts } from './posts'

export const postsQueryOptions = queryOptions({
  queryKey: ['posts'],
  queryFn: () => fetchPosts(),
})
