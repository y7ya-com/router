<script lang="ts" generics="TRouter extends AnyRouter = RegisteredRouter">
  import { setContext } from 'svelte'
  import type { Component } from 'svelte'
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
</script>

{#snippet inner()}
  {#if (router.options as any).disableGlobalCatchBoundary}
    <Matches />
  {:else}
    <svelte:boundary>
      <Matches />
      {#snippet failed(error)}
        <ErrorComponent error={error as Error} info={{ componentStack: '' }} />
      {/snippet}
    </svelte:boundary>
  {/if}
{/snippet}

{#if Wrap}
  <Wrap>{@render inner()}</Wrap>
{:else}
  {@render inner()}
{/if}
