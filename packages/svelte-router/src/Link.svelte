<script
  lang="ts"
  generics="TRouter extends AnyRouter = RegisteredRouter, TFrom extends string = string, TTo extends string | undefined = undefined, TMaskFrom extends string = TFrom, TMaskTo extends string = ''"
>
  import type { Component } from 'svelte'
  import type { AnyRouter, RegisteredRouter } from '@tanstack/router-core'
  import { useLinkProps } from './useLinkProps.svelte.js'
  import type { UseLinkPropsOptions } from './useLinkProps.svelte.js'
  import type { LinkElementProps } from './link.js'

  // Route-aware props: `to`, `params` and `search` are checked against the
  // registered route tree, as in the other ports. A single named type keeps
  // the emitted declaration portable.
  let {
    children,
    _asChild,
    ...linkProps
  }: LinkElementProps<TRouter, TFrom, TTo, TMaskFrom, TMaskTo> = $props()

  // All link computation — href, active state, class/style merging, composed
  // event handlers — lives in `useLinkProps`, which is also exported
  // standalone. This component adds only what needs a DOM element: the render
  // branches and viewport/render preloading.
  const link = useLinkProps(() => linkProps as UseLinkPropsOptions)

  const disabled = $derived((linkProps as UseLinkPropsOptions).disabled)

  // Not `$state`: `bind:this` assigns this once during mount, before any
  // `$effect` runs, and the element reference never changes afterward — so the
  // viewport-preload effect already sees the bound element on its first run.
  // svelte-ignore non_reactive_update
  let anchorEl: HTMLAnchorElement | undefined
  let observer: IntersectionObserver | undefined

  $effect(() => {
    // viewport preload: observe via IntersectionObserver
    if (link.effectivePreload !== 'viewport') {
      return
    }
    if (!anchorEl) {
      return
    }
    if (typeof IntersectionObserver === 'undefined') {
      return
    }
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          link.schedulePreload()
        } else {
          link.cancelPreload()
        }
      }
    })
    observer.observe(anchorEl)
    return () => {
      observer?.disconnect()
      observer = undefined
      link.cancelPreload()
    }
  })

  $effect(() => {
    // render preload: fire on mount once
    if (link.effectivePreload !== 'render') {
      return
    }
    link.preload()
  })
</script>

{#if _asChild === undefined}
  <a bind:this={anchorEl} {...link.attrs}>
    {#if children}
      {@render children({ isActive: link.isActive })}
    {/if}
  </a>
{:else if typeof _asChild === 'string' && (linkProps as Record<string, unknown>).xmlns === 'http://www.w3.org/2000/svg'}
  <!-- A link inside an <svg>: the element must be created in the SVG
       namespace, which `<svelte:element>` only does for a static `xmlns`. -->
  <svelte:element
    this={_asChild}
    xmlns="http://www.w3.org/2000/svg"
    bind:this={anchorEl}
    {...{ disabled, ...link.attrs } as Record<string, unknown>}
  >
    {#if children}
      {@render children({ isActive: link.isActive })}
    {/if}
  </svelte:element>
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
