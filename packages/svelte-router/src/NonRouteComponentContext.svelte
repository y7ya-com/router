<script module lang="ts">
  export type NonRouteComponent =
    | 'pendingComponent'
    | 'errorComponent'
    | 'notFoundComponent'

  export const nonRouteComponentContextKey = Symbol(
    'tsr.nonRouteComponentContext',
  )
</script>

<script lang="ts">
  import { setContext } from 'svelte'
  import type { Snippet } from 'svelte'

  // Marks its children as a pending/error/not-found component so a nested
  // `<Outlet />` can warn in development.
  let {
    component,
    children,
  }: { component: NonRouteComponent; children: Snippet } = $props()

  // svelte-ignore state_referenced_locally
  if (process.env.NODE_ENV !== 'production') {
    setContext(nonRouteComponentContextKey, component)
  }
</script>

{@render children()}
