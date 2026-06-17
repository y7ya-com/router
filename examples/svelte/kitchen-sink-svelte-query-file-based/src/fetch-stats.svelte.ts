// A tiny reactive counter of *real* network fetches. The whole point of the
// router + query integration is that a value prefetched in a loader is reused
// by `createQuery` — so this number stops going up once data is cached.
export const fetchStats = $state({ count: 0 })
