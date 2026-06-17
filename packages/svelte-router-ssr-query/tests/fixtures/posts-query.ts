// Shared between the route loader (prefetch) and the component (`createQuery`).
// A plain counter — not vi.fn — so the fixture can be imported by a `.svelte`
// component without pulling vitest into the component graph.
export const stats = { fetchCount: 0 }

export async function fetchPosts(): Promise<string> {
  stats.fetchCount++
  return 'POSTS_FROM_QUERY'
}

export const postsQueryOptions = () => ({
  queryKey: ['posts'] as const,
  queryFn: fetchPosts,
  staleTime: Infinity,
})
