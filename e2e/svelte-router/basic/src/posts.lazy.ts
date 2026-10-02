import { createLazyRoute } from '@tanstack/svelte-router'
import Posts from './components/Posts.svelte'

export const Route = createLazyRoute('/posts')({
  component: Posts,
})
