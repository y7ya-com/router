<script lang="ts">
  import type { Snippet } from 'svelte'
  import { useRouter } from './useRouter'
  import { useSelector } from '@tanstack/svelte-store'

  type Props = Record<string, unknown> & {
    children?: Snippet<[]>
    match?: Snippet<[any]>
  }

  let { children, match, ...opts }: Props = $props()

  const router = useRouter()
  // Subscribe to matchRouteDeps so re-renders propagate when the route changes.
  const deps = useSelector(router.stores.matchRouteDeps, (s) => s)
  const currentMatch = $derived.by(() => {
    // Read deps so this re-runs when navigation updates the route tree.
    void deps.current
    const { pending, caseSensitive, fuzzy, includeSearch, ...rest } = opts as any
    return router.matchRoute(rest, {
      pending,
      caseSensitive,
      fuzzy,
      includeSearch,
    })
  })
</script>

{#if match}
  {@render match(currentMatch as any)}
{:else if children && currentMatch}
  {@render children()}
{/if}
