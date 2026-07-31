<script lang="ts" generics="TRouter extends AnyRouter = RegisteredRouter">
  import type { AnyRouter, RegisteredRouter } from '@tanstack/router-core'
  import type { Component, Snippet } from 'svelte'
  import { useLinkProps } from './useLinkProps.svelte'
  import type { LinkStateProps } from './useLinkProps.svelte'

  type Props = {
    to?: string
    from?: string
    params?: Record<string, unknown> | true
    search?:
      | Record<string, unknown>
      | true
      | ((prev: Record<string, unknown>) => Record<string, unknown>)
    hash?: string | ((prev: string) => string)
    replace?: boolean
    resetScroll?: boolean
    preload?: 'intent' | 'viewport' | 'render' | false
    preloadDelay?: number
    activeOptions?: {
      exact?: boolean
      includeHash?: boolean
      includeSearch?: boolean
      explicitUndefined?: boolean
    }
    disabled?: boolean
    target?: string
    rel?: string
    activeProps?: LinkStateProps | (() => LinkStateProps)
    inactiveProps?: LinkStateProps | (() => LinkStateProps)
    mask?: unknown
    reloadDocument?: boolean
    ignoreBlocker?: boolean
    startTransition?: boolean
    viewTransition?: unknown
    children?: Snippet<[{ isActive: boolean }]> | Snippet<[]>
    [key: string]: unknown
  }

  let { children, _asChild, ...linkProps }: Props & { _asChild?: any } =
    $props()

  // All link computation — href, active state, class/style merging, composed
  // event handlers — lives in `useLinkProps` (also exported standalone,
  // mirroring solid-router). This component adds only what needs a DOM
  // element: the render branches and viewport/render preloading.
  const link = useLinkProps(() => linkProps)

  const disabled = $derived(linkProps.disabled as boolean | undefined)

  // Not `$state`: `bind:this` assigns this once during mount, before any
  // `$effect` runs, and the element reference never changes afterward — so the
  // viewport-preload effect already sees the bound element on its first run.
  // svelte-ignore non_reactive_update
  let anchorEl: HTMLAnchorElement | undefined
  let observer: IntersectionObserver | undefined

  $effect(() => {
    // viewport preload: observe via IntersectionObserver
    if (link.effectivePreload !== 'viewport') return
    if (!anchorEl) return
    if (typeof IntersectionObserver === 'undefined') return
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          link.preload()
        }
      }
    })
    observer.observe(anchorEl)
    return () => {
      observer?.disconnect()
      observer = undefined
    }
  })

  $effect(() => {
    // render preload: fire on mount once
    if (link.effectivePreload !== 'render') return
    link.preload()
  })
</script>

{#if _asChild === undefined}
  <a bind:this={anchorEl} {...link.attrs}>
    {#if children}
      {@render children({ isActive: link.isActive })}
    {/if}
  </a>
{:else if typeof _asChild === 'string'}
  <!--
    `<svelte:element>` with a dynamic `this` types its attributes as the generic
    `HTMLAttributes<any>`, which has no anchor-specific props (`href`/`target`/
    `rel`). Spreading them as one `Record` applies them without the
    per-attribute known-property check. `bind:this` stays a directive (can't be
    spread).
  -->
  <svelte:element
    this={_asChild}
    bind:this={anchorEl}
    {...{ disabled, ...link.attrs } as Record<string, unknown>}
  >
    {#if children}
      {@render children({ isActive: link.isActive })}
    {/if}
  </svelte:element>
{:else}
  {@const C = _asChild as Component<any>}
  <C {disabled} {...link.attrs}>
    {#if children}
      {@render children({ isActive: link.isActive })}
    {/if}
  </C>
{/if}
