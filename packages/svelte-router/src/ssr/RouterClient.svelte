<script lang="ts">
  import { setContext } from 'svelte'
  import { hydrate } from '@tanstack/router-core/ssr/client'
  import { isServer } from '@tanstack/router-core/isServer'
  import RouterProvider from '../RouterProvider.svelte'
  import HeadContent from '../HeadContent.svelte'
  import { headSlotContextKey, routerContextKey } from '../routerContext'
  import type { AnyRouter } from '@tanstack/router-core'

  type Props = { router: AnyRouter }
  let { router }: Props = $props()

  // `HeadContent` is a sibling of `RouterProvider`, so set the router context at
  // this level (same as RouterServer) so its `useRouter()` resolves.
  setContext(routerContextKey, router)
  // Claim a single head slot so a stray second `<HeadContent />` is a no-op.
  setContext(headSlotContextKey, { used: false })

  // Kick off hydration synchronously. `hydrate()` reads the dehydrated match
  // state into the stores up front (then resolves async loaders in the
  // background), so the very first client render already has the matches and
  // produces the same markup as the server — which is what Svelte hydration
  // requires. Gating the render behind `{#await}` (the previous approach) made
  // the initial client render empty and broke hydration.
  if (!(isServer ?? router.isServer) && !router.stores.matchesId.get().length) {
    void hydrate(router as any)
  }
</script>

<HeadContent />
<RouterProvider {router} />
