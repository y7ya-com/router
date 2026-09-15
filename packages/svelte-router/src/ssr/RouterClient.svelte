<script lang="ts">
  import { setContext } from 'svelte'
  import { hydrate } from '@tanstack/router-core/ssr/client'
  import { isServer } from '@tanstack/router-core/isServer'
  import RouterProvider from '../RouterProvider.svelte'
  import HeadContent from '../HeadContent.svelte'
  import Scripts from '../Scripts.svelte'
  import { headSlotContextKey, routerContextKey } from '../routerContext.js'
  import type { AnyRouter } from '@tanstack/router-core'

  type Props = { router: AnyRouter }
  let { router }: Props = $props()

  // `HeadContent` and `Scripts` are siblings of `RouterProvider`, so set the
  // router context at this level (same as RouterServer).
  // svelte-ignore state_referenced_locally
  setContext(routerContextKey, router)
  // Claim a single head slot so a stray second `<HeadContent />` is a no-op.
  setContext(headSlotContextKey, { used: false })

  // Kick off hydration synchronously. `hydrate()` reads the dehydrated match
  // state into the stores up front (then resolves async loaders in the
  // background), so the very first client render already has the matches and
  // produces the same markup as the server — which is what Svelte hydration
  // requires. Gating the render behind `{#await}` (the previous approach) made
  // the initial client render empty and broke hydration.
  // svelte-ignore state_referenced_locally
  if (!(isServer ?? router.isServer) && !router.stores.ids.get().length) {
    void hydrate(router as any)
  }
</script>

<!-- Mirrors RouterServer so the client hydrates the tree the server rendered:
     hydrate this component into `document.body`. -->
<HeadContent />
<div id="app"><RouterProvider {router} /></div>
<Scripts />
