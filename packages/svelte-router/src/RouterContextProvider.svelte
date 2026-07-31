<script lang="ts" generics="TRouter extends AnyRouter = RegisteredRouter">
  import { hasContext, setContext } from 'svelte'
  import type { Component, Snippet } from 'svelte'
  import type {
    AnyRouter,
    RegisteredRouter,
    RouterOptions,
  } from '@tanstack/router-core'
  import { headSlotContextKey, routerContextKey } from './routerContext'

  type Props = {
    router: TRouter
    context?: Partial<TRouter['options']['context']>
    Wrap?: Component<any>
    children: Snippet
    [key: string]: unknown
  }

  let { router, Wrap, children, ...rest }: Props = $props()

  // Allow the render site to update options on the router instance —
  // mirrors solid-router's RouterContextProvider.
  router.update({
    ...router.options,
    ...(rest as Partial<RouterOptions<any, any, any, any, any>>),
    context: {
      ...router.options.context,
      ...(rest as any).context,
    },
  })

  setContext(routerContextKey, router)

  // Head slot: lets `HeadContent` render at most once per tree. The SSR
  // scaffolds (RouterServer/RouterClient) seed it above us — and their own
  // `<HeadContent />` has already claimed it — so only seed when it is absent
  // (pure SPA). Seeding unconditionally would shadow the scaffold's claimed
  // slot with a fresh unclaimed one for the whole route tree, letting a user's
  // `<HeadContent />` render a second set of `<meta>` tags under SSR.
  if (!hasContext(headSlotContextKey)) {
    setContext(headSlotContextKey, { used: false })
  }

  // `router.options.Wrap` is how integrations (e.g. ssr-query) inject a
  // provider around the whole route tree — mirrors react/solid-router. The
  // `Wrap` prop is composed outside it.
  const OptionsWrap = (router.options as { Wrap?: Component<{ children: Snippet }> })
    .Wrap
</script>

{#snippet wrapped()}
  {#if OptionsWrap}
    <OptionsWrap>{@render children()}</OptionsWrap>
  {:else}
    {@render children()}
  {/if}
{/snippet}

{#if Wrap}
  <Wrap>{@render wrapped()}</Wrap>
{:else}
  {@render wrapped()}
{/if}
