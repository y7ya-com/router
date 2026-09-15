<script
  lang="ts"
  generics="TRouter extends AnyRouter = RegisteredRouter, TFrom extends string = string, TTo extends string | undefined = undefined, TMaskFrom extends string = TFrom, TMaskTo extends string = ''"
>
  import type { AnyRouter, RegisteredRouter } from '@tanstack/router-core'
  import { useRouter } from './useRouter.js'
  import { useRouterSelector } from './utils.js'
  import type { MakeMatchRouteOptions } from './useMatches.svelte.js'

  let {
    children,
    match,
    ...opts
  }: MakeMatchRouteOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo> = $props()

  const router = useRouter()
  // Re-evaluate whenever navigation state changes.
  const locationSel = useRouterSelector(router, router.stores.location)
  const resolvedLocationSel = useRouterSelector(
    router,
    router.stores.resolvedLocation,
  )
  const statusSel = useRouterSelector(router, router.stores.status)
  const currentMatch = $derived.by(() => {
    void locationSel.current
    void resolvedLocationSel.current
    void statusSel.current
    const { pending, caseSensitive, fuzzy, includeSearch, ...rest } =
      opts as any
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
