import { hydrate as svelteHydrate } from 'svelte'
import {
  RouterClient,
  hydrate as hydrateRouter,
} from '@tanstack/svelte-router/ssr/client'
import { createRouter } from './router'

const router = createRouter()

async function bootstrap() {
  // Rehydrate the router (matches + dehydrated query cache) BEFORE Svelte
  // hydrates the components. Svelte hydration renders synchronously, so if we
  // didn't do this first, `createQuery` would run against an empty cache and
  // refetch. Awaiting here lands the query cache before the first render — zero
  // client refetch — while the server-rendered DOM stays on screen.
  if (!router.stores.matchesId.get().length) {
    await hydrateRouter(router as any)
  }

  const target = document.getElementById('app')
  if (target) {
    svelteHydrate(RouterClient, { target, props: { router } })
  }
}

void bootstrap()
