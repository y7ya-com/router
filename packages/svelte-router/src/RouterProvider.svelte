<script lang="ts" generics="TRouter extends AnyRouter = RegisteredRouter">
  import type { AnyRouter, RegisteredRouter } from '@tanstack/router-core'
  import RouterContextProvider from './RouterContextProvider.svelte'
  import Matches from './Matches.svelte'
  import ErrorComponent from './ErrorComponent.svelte'
  import { toError } from './utils.js'
  import type { RouterProps } from './router.js'

  let { router, ...rest }: RouterProps<TRouter> = $props()
</script>

<RouterContextProvider {router} {...rest}>
  {#if (router.options as any).disableGlobalCatchBoundary}
    <Matches />
  {:else}
    <svelte:boundary>
      <Matches />
      {#snippet failed(error)}
        <ErrorComponent error={toError(error)} />
      {/snippet}
    </svelte:boundary>
  {/if}
</RouterContextProvider>
