import {
  index,
  layout,
  physical,
  rootRoute,
  route,
} from '@tanstack/virtual-file-routes'

export const routes = rootRoute('root.svelte', [
  index('home.svelte'),
  route('/posts', 'posts/posts.svelte', [
    index('posts/posts-home.svelte'),
    route('$postId', 'posts/posts-detail.svelte'),
  ]),
  layout('first', 'layout/first-layout.svelte', [
    layout('second', 'layout/second-layout.svelte', [
      route('/layout-a', 'a.svelte'),
      route('/layout-b', 'b.svelte'),
    ]),
  ]),
  physical('/classic', 'file-based-subtree'),
])
