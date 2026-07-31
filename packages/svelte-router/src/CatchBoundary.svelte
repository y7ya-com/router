<script lang="ts">
  import type { Component, Snippet } from 'svelte'
  import type { ErrorComponentProps } from '@tanstack/router-core'

  type Props = {
    getResetKey: () => unknown
    children?: Snippet
    onCatch?: (error: Error, info?: { componentStack: string }) => void
    errorComponent?: Component<ErrorComponentProps> | Snippet<[ErrorComponentProps]>
  }

  let {
    getResetKey,
    children,
    onCatch,
    errorComponent,
  }: Props = $props()

  // Use Svelte 5's <svelte:boundary> for error catching.
  function onerror(error: unknown, _reset: () => void) {
    const err = error instanceof Error ? error : new Error(String(error))
    onCatch?.(err, { componentStack: '' })
  }

  // The reset key — when it changes, the boundary should "reset" by remounting children.
  const resetKey = $derived(getResetKey())

  function isSnippet(value: unknown): boolean {
    return (
      typeof value === 'function' &&
      Object.getOwnPropertySymbols(value).some((s) =>
        s.description?.includes('snippet'),
      )
    )
  }
</script>

{#key resetKey}
  <svelte:boundary {onerror}>
    {#if children}{@render children()}{/if}

    {#snippet failed(error)}
      {#if errorComponent}
        {#if isSnippet(errorComponent)}
          {@render (errorComponent as Snippet<[ErrorComponentProps]>)({ error: error as Error, info: { componentStack: '' }, reset: () => {} })}
        {:else}
          {@const EC = errorComponent as Component<ErrorComponentProps>}
          <EC error={error as Error} info={{ componentStack: '' }} reset={() => {}} />
        {/if}
      {/if}
    {/snippet}
  </svelte:boundary>
{/key}
