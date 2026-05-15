<script lang="ts" generics="TRouter extends AnyRouter = RegisteredRouter, TWithResolver extends boolean = boolean">
  import type { AnyRouter, RegisteredRouter } from '@tanstack/router-core'
  import type { Snippet } from 'svelte'
  import {
    useBlocker,
    type BlockerResolver,
    type UseBlockerOpts,
  } from './useBlocker.svelte'

  type Props = UseBlockerOpts<TRouter, TWithResolver> & {
    children?: Snippet<[{ readonly current: BlockerResolver<TRouter> }]>
  }

  let { children, ...rest }: Props = $props()

  // Use a Proxy so `useBlocker` reads each property reactively from `rest`
  // (the `$props()` rest object is reactive in Svelte 5), rather than from
  // a one-time snapshot taken via spread.
  const reactiveOpts = new Proxy({} as any, {
    get(_t, key) {
      if (key === 'withResolver') return true
      return (rest as any)[key as any]
    },
    has(_t, key) {
      if (key === 'withResolver') return true
      return key in (rest as any)
    },
    ownKeys() {
      return [...Object.keys(rest as any), 'withResolver']
    },
    getOwnPropertyDescriptor(_t, key) {
      return { enumerable: true, configurable: true, value: (rest as any)[key as any] }
    },
  })

  const resolver = useBlocker(
    reactiveOpts as UseBlockerOpts<TRouter, true>,
  ) as { readonly current: BlockerResolver<TRouter> }
</script>

{#if children}
  {@render children(resolver)}
{/if}
