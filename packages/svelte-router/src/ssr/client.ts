export { default as RouterClient } from './RouterClient.svelte'
// Re-export so SSR entry-clients can await router hydration (matches + the
// dehydrated query cache) before Svelte hydrates the components.
export { hydrate } from '@tanstack/router-core/ssr/client'
