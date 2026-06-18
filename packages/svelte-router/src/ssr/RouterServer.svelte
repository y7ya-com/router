<script lang="ts">
  import { setContext } from 'svelte'
  import RouterProvider from '../RouterProvider.svelte'
  import HeadContent from '../HeadContent.svelte'
  import Scripts from '../Scripts.svelte'
  import { routerContextKey } from '../routerContext'
  import type { AnyRouter } from '@tanstack/router-core'

  type Props = { router: AnyRouter }
  let { router }: Props = $props()

  // `HeadContent` and `Scripts` are siblings of `RouterProvider` here, so they
  // don't inherit the context it sets. Establish it at this level so their
  // `useRouter()` resolves during server render.
  setContext(routerContextKey, router)
</script>

<!--
  Only the app (RouterProvider) goes inside `#app`; that's the single element the
  client hydrates. HeadContent renders into `<svelte:head>` (the document head)
  and Scripts (dehydration + asset scripts) sit *after* `#app` — both outside the
  hydration boundary, so the server/client trees match. This mirrors how
  solid-router uses `<NoHydration>` around the scaffold + `<Hydration>` around the
  app.
-->
<HeadContent />
<div id="app"><RouterProvider {router} /></div>
<Scripts />
