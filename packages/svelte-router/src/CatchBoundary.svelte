<script lang="ts">
  import { isSnippet, toError } from './utils.js'
  import ErrorComponent from './ErrorComponent.svelte'
  import NonRouteComponentContext from './NonRouteComponentContext.svelte'
  import type { Component, Snippet } from 'svelte'
  import type { ErrorComponentProps } from '@tanstack/router-core'

  type Props = {
    getResetKey: () => unknown
    children?: Snippet
    onCatch?: (error: Error, info?: { componentStack: string }) => void
    errorComponent?:
      | Component<ErrorComponentProps>
      | Snippet<[ErrorComponentProps]>
  }

  let { getResetKey, children, onCatch, errorComponent }: Props = $props()

  function onerror(error: unknown) {
    onCatch?.(toError(error), { componentStack: '' })
  }

  // A new reset key remounts the boundary, clearing a caught error.
  const resetKey = $derived(getResetKey())
</script>

{#key resetKey}
  <svelte:boundary {onerror}>
    {@render children?.()}

    {#snippet failed(error, reset)}
      <NonRouteComponentContext component="errorComponent">
        {#if isSnippet(errorComponent)}
          {@render (errorComponent as Snippet<[ErrorComponentProps]>)({
            error: toError(error),
            info: { componentStack: '' },
            reset,
          })}
        {:else}
          {@const EC = (errorComponent ??
            ErrorComponent) as Component<ErrorComponentProps>}
          <EC error={toError(error)} info={{ componentStack: '' }} {reset} />
        {/if}
      </NonRouteComponentContext>
    {/snippet}
  </svelte:boundary>
{/key}
