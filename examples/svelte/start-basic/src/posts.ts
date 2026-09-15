import { notFound } from '@tanstack/svelte-router'
import { createServerFn } from '@tanstack/svelte-start'

export type PostType = {
  id: number
  title: string
  body: string
}

export const fetchPost = createServerFn({ method: 'GET' })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    console.info(`Fetching post with id ${data}...`)
    const res = await fetch(
      `https://jsonplaceholder.typicode.com/posts/${data}`,
    )
    if (!res.ok) {
      if (res.status === 404) {
        throw notFound()
      }
      throw new Error('Failed to fetch post')
    }
    return (await res.json()) as PostType
  })

export const fetchPosts = createServerFn({ method: 'GET' }).handler(
  async () => {
    console.info('Fetching posts...')
    const res = await fetch('https://jsonplaceholder.typicode.com/posts')
    if (!res.ok) {
      throw new Error('Failed to fetch posts')
    }
    return ((await res.json()) as Array<PostType>).slice(0, 10)
  },
)
