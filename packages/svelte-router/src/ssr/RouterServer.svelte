<script lang="ts">
  import RouterProvider from '../RouterProvider.svelte'
  import HeadContent from '../HeadContent.svelte'
  import Scripts from '../Scripts.svelte'
  import type { AnyRouter } from '@tanstack/router-core'

  type Props = { router: AnyRouter }
  let { router }: Props = $props()
</script>

<!--
  TODO(svelte-port): full HTML scaffold matching solid-router's NoHydration / Hydration
  wrappers. v1 emits HeadContent + RouterProvider; Svelte's renderRouterToString prepends
  the doctype and HTML structure.
-->
<HeadContent />
<RouterProvider {router} />
<Scripts />
