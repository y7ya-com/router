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
  TODO(svelte-port): full HTML scaffold matching solid-router's NoHydration / Hydration
  wrappers. v1 emits HeadContent + RouterProvider; Svelte's renderRouterToString prepends
  the doctype and HTML structure.
-->
<HeadContent />
<RouterProvider {router} />
<Scripts />
