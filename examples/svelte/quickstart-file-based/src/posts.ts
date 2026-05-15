import { notFound } from '@tanstack/svelte-router'

export type Post = {
  id: number
  title: string
  body: string
  userId: number
}

const API = 'https://jsonplaceholder.typicode.com'

/** Simulate a slow network so the pending state is observable. */
const lag = (ms = 400) => new Promise((r) => setTimeout(r, ms))

export async function fetchPosts(): Promise<Array<Post>> {
  await lag()
  const res = await fetch(`${API}/posts?_limit=10`)
  if (!res.ok) throw new Error('Failed to load posts')
  return res.json()
}

export async function fetchPost(postId: string): Promise<Post> {
  await lag()
  const res = await fetch(`${API}/posts/${postId}`)
  if (res.status === 404) throw notFound()
  if (!res.ok) throw new Error(`Failed to load post #${postId}`)
  return res.json()
}
