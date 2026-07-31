<script lang="ts" generics="TRouter extends AnyRouter = RegisteredRouter">
  import type { Component } from 'svelte'
  import type { AnyRouter, RegisteredRouter } from '@tanstack/router-core'
  import RouterContextProvider from './RouterContextProvider.svelte'
  import Matches from './Matches.svelte'
  import ErrorComponent from './ErrorComponent.svelte'

  type Props = {
    router: TRouter
    context?: Partial<TRouter['options']['context']>
    Wrap?: Component<any>
    [key: string]: unknown
  }

  // RouterProvider = RouterContextProvider + Matches — mirrors solid-router,
  // where the context provider is also exported standalone for callers that
  // render their own tree (e.g. custom shells, testing harnesses).
  let { router, ...rest }: Props = $props()
</script>

<RouterContextProvider {router} {...rest}>
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
</RouterContextProvider>
