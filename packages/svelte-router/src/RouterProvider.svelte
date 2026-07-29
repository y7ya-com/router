<script lang="ts" generics="TRouter extends AnyRouter = RegisteredRouter">
  import { setContext } from 'svelte'
  import type { Component, Snippet } from 'svelte'
  import type {
    AnyRouter,
    RegisteredRouter,
    RouterOptions,
  } from '@tanstack/router-core'
  import { routerContextKey } from './routerContext'
  import Matches from './Matches.svelte'
  import ErrorComponent from './ErrorComponent.svelte'

  type Props = {
    router: TRouter
    context?: Partial<TRouter['options']['context']>
    Wrap?: Component<any>
    [key: string]: unknown
  }

  let { router, Wrap, ...rest }: Props = $props()

  router.update({
    ...router.options,
    ...(rest as Partial<RouterOptions<any, any, any, any, any>>),
    context: {
      ...router.options.context,
      ...(rest as any).context,
    },
  })

  setContext(routerContextKey, router)

  // `router.options.Wrap` is how integrations (e.g. ssr-query) inject a
  // provider around the whole route tree — mirrors react/solid-router. The
  // `Wrap` prop is composed outside it.
  const OptionsWrap = (router.options as { Wrap?: Component<{ children: Snippet }> })
    .Wrap
</script>

{#snippet inner()}
  {#if (router.options as any).disableGlobalCatchBoundary}
    <Matches />
  {:else}
    <svelte:boundary>
      <Matches />
      {#snippet failed(error, reset)}
        <ErrorComponent
          error={error as Error}
          reset={reset as () => void}
          info={{ componentStack: '' }}
        />
      {/snippet}
    </svelte:boundary>
  {/if}
{/snippet}

{#snippet wrapped()}
  {#if OptionsWrap}
    <OptionsWrap>{@render inner()}</OptionsWrap>
  {:else}
    {@render inner()}
  {/if}
{/snippet}

{#if Wrap}
  <Wrap>{@render wrapped()}</Wrap>
{:else}
  {@render wrapped()}
{/if}
