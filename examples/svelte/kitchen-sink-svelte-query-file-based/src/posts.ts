import { notFound } from '@tanstack/svelte-router'
import { queryOptions } from '@tanstack/svelte-query'
import { fetchStats } from './fetch-stats.svelte'

export type Post = {
  id: number
  title: string
  body: string
  userId: number
}

const API = 'https://jsonplaceholder.typicode.com'

/** Simulate a slow network so pending states (and caching) are observable. */
const lag = (ms = 500) => new Promise((r) => setTimeout(r, ms))

export async function fetchPosts(): Promise<Array<Post>> {
  fetchStats.count++
  await lag()
  const res = await fetch(`${API}/posts?_limit=10`)
  if (!res.ok) throw new Error('Failed to load posts')
  return res.json()
}

export async function fetchPost(postId: string): Promise<Post> {
  fetchStats.count++
  await lag()
  // jsonplaceholder has 100 posts; anything else is a real 404.
  const res = await fetch(`${API}/posts/${postId}`)
  if (res.status === 404) throw notFound()
  if (!res.ok) throw new Error(`Failed to load post #${postId}`)
  return res.json()
}

// `queryOptions` keeps the key + fetcher in one typed place, reused by both the
// route loader (`ensureQueryData`) and the component (`createQuery`).
export const postsQueryOptions = () =>
  queryOptions({ queryKey: ['posts'], queryFn: fetchPosts })

export const postQueryOptions = (postId: string) =>
  queryOptions({
    queryKey: ['posts', postId],
    queryFn: () => fetchPost(postId),
  })
