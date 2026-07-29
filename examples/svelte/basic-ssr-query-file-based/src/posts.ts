import { queryOptions } from '@tanstack/svelte-query'

export type Post = { id: number; title: string; body: string }

const API = 'https://jsonplaceholder.typicode.com'

// Counts fetches *per process*. On the server this ticks during render; on the
// client it should NOT tick for data the server already prefetched + dehydrated.
export const fetchLog: Array<string> = []

export async function fetchPosts(): Promise<Array<Post>> {
  fetchLog.push(`posts @ ${typeof window === 'undefined' ? 'server' : 'client'}`)
  const res = await fetch(`${API}/posts?_limit=5`)
  if (!res.ok) throw new Error('Failed to load posts')
  return res.json()
}

export const postsQueryOptions = () =>
  queryOptions({ queryKey: ['posts'], queryFn: fetchPosts })

// Returns `null` (not a throw) for a missing id, so the route loader can decide
// to `throw notFound()` — keeping the "post doesn't exist" path distinct from a
// real fetch error.
export async function fetchPost(id: string): Promise<Post | null> {
  fetchLog.push(
    `post ${id} @ ${typeof window === 'undefined' ? 'server' : 'client'}`,
  )
  const res = await fetch(`${API}/posts/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to load post ${id}`)
  return res.json()
}

export const postQueryOptions = (id: string) =>
  queryOptions({ queryKey: ['post', id], queryFn: () => fetchPost(id) })
