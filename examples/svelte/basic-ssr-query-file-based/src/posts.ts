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
