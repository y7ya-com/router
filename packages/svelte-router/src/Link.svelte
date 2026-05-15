<script lang="ts" generics="TRouter extends AnyRouter = RegisteredRouter">
  import type { AnyRouter, RegisteredRouter } from '@tanstack/router-core'
  import { deepEqual } from '@tanstack/router-core'
  import type { Component, Snippet } from 'svelte'
  import { useSelector } from '@tanstack/svelte-store'
  import { useRouter } from './useRouter'
  import { onMount, onDestroy } from 'svelte'

  type LinkStateProps = {
    class?: string
    style?: Record<string, unknown> | string
    [key: string]: unknown
  }

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

  let {
    to,
    from,
    params,
    search,
    hash,
    replace,
    resetScroll,
    preload,
    preloadDelay,
    preloadIntentProximity,
    hashScrollIntoView,
    activeOptions,
    disabled,
    target,
    rel,
    activeProps,
    inactiveProps,
    mask,
    reloadDocument,
    ignoreBlocker,
    startTransition,
    viewTransition,
    state,
    unsafeRelative,
    children,
    _asChild,
    ...rest
  }: Props & { _asChild?: any } = $props()

  const router = useRouter()
  const locationSel = useSelector(router.stores.location)

  const buildOpts = $derived({
    to,
    from,
    params,
    search,
    hash,
    replace,
    resetScroll,
    mask,
    unsafeRelative,
    state,
    ignoreBlocker,
  })

  const isExternal = $derived(
    typeof to === 'string' && /^(https?:)?\/\//.test(to),
  )

  const href = $derived.by(() => {
    if (isExternal) return to as string
    // Read the location selector so this derived re-runs when navigation
    // changes the current URL/params.
    void locationSel.current
    try {
      const next = router.buildLocation(buildOpts as any) as any
      const location = next.maskedLocation ?? next
      const publicHref = location.publicHref ?? location.href
      if (location.external) return publicHref
      return router.history.createHref(publicHref) || '/'
    } catch {
      return ''
    }
  })

  function handleClick(e: MouseEvent) {
    if (disabled) {
      e.preventDefault()
      return
    }
    if (isExternal) return
    // Use the actual DOM element's target if the prop wasn't set — this lets
    // a custom `_asChild` component override `target` (e.g. set `_blank`).
    const effectiveTarget =
      target ??
      ((e.currentTarget as HTMLAnchorElement | null)?.target || undefined)
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      (effectiveTarget && effectiveTarget !== '_self')
    ) {
      return
    }
    e.preventDefault()
    router.navigate(buildOpts as any)
  }

  const effectivePreload = $derived(
    preload ?? router.options.defaultPreload,
  )

  function handleFocus() {
    if (disabled || isExternal || effectivePreload !== 'intent') return
    router.preloadRoute(buildOpts as any).catch(() => {})
  }

  function handleMouseEnter() {
    if (disabled || isExternal || effectivePreload !== 'intent') return
    router.preloadRoute(buildOpts as any).catch(() => {})
  }

  function handleTouchStart() {
    if (disabled || isExternal || effectivePreload !== 'intent') return
    router.preloadRoute(buildOpts as any).catch(() => {})
  }

  let anchorEl: HTMLAnchorElement | undefined
  let observer: IntersectionObserver | undefined

  $effect(() => {
    // viewport preload: observe via IntersectionObserver
    if (disabled || isExternal) return
    if (effectivePreload !== 'viewport') return
    if (!anchorEl) return
    if (typeof IntersectionObserver === 'undefined') return
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          router.preloadRoute(buildOpts as any).catch(() => {})
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
    if (disabled || isExternal) return
    if (effectivePreload !== 'render') return
    router.preloadRoute(buildOpts as any).catch(() => {})
  })

  const isActive = $derived.by(() => {
    if (!to) return false
    if (isExternal) return false
    try {
      const nextLocation = router.buildLocation(buildOpts as any) as any
      const current = locationSel.current as any
      const currentPath = current.pathname as string
      const nextPath = nextLocation.pathname as string
      const basepath = (router as any).basepath ?? '/'

      const removeTrailing = (p: string) => {
        const base = basepath === '/' ? '' : basepath
        if (p === '/' || p === base) return base || '/'
        return p.endsWith('/') ? p.slice(0, -1) : p
      }

      if (activeOptions?.exact) {
        const cp = removeTrailing(currentPath)
        const np = removeTrailing(nextPath)
        if (cp !== np) return false
      } else {
        const cp = removeTrailing(currentPath)
        const np = removeTrailing(nextPath)
        const fuzzy =
          cp.startsWith(np) && (cp.length === np.length || cp[np.length] === '/')
        if (!fuzzy) return false
      }

      if (activeOptions?.includeSearch ?? true) {
        const searchTest = deepEqual(
          current.search ?? {},
          nextLocation.search ?? {},
          {
            partial: !activeOptions?.exact,
            ignoreUndefined: !activeOptions?.explicitUndefined,
          },
        )
        if (!searchTest) return false
      }

      if (activeOptions?.includeHash) {
        return (current.hash ?? '') === (nextLocation.hash ?? '')
      }
      return true
    } catch {
      return false
    }
  })

  const resolvedActiveProps = $derived(
    typeof activeProps === 'function'
      ? activeProps()
      : activeProps !== undefined
        ? activeProps
        : { class: 'active' },
  )
  const resolvedInactiveProps = $derived(
    typeof inactiveProps === 'function' ? inactiveProps() : (inactiveProps ?? {}),
  )

  // Merge classes/styles from active+inactive+rest, depending on state
  const mergedClass = $derived.by(() => {
    const parts: Array<string> = []
    const restCls = (rest as any).class
    if (restCls) parts.push(restCls)
    if (isActive && resolvedActiveProps.class) parts.push(resolvedActiveProps.class)
    if (!isActive && resolvedInactiveProps.class) parts.push(resolvedInactiveProps.class)
    return parts.length > 0 ? parts.join(' ') : undefined
  })

  const mergedStyle = $derived.by(() => {
    const parts: Array<string> = []
    const restStyle = (rest as any).style
    if (restStyle) {
      if (typeof restStyle === 'string') parts.push(restStyle)
      else if (typeof restStyle === 'object') {
        for (const [k, v] of Object.entries(restStyle)) parts.push(`${k}: ${v}`)
      }
    }
    const stateStyle = isActive ? resolvedActiveProps.style : resolvedInactiveProps.style
    if (stateStyle) {
      if (typeof stateStyle === 'string') parts.push(stateStyle)
      else if (typeof stateStyle === 'object') {
        for (const [k, v] of Object.entries(stateStyle)) parts.push(`${k}: ${v}`)
      }
    }
    return parts.length > 0 ? parts.join('; ') : undefined
  })

  const remainingRest = $derived.by(() => {
    const r: Record<string, unknown> = { ...(rest as Record<string, unknown>) }
    delete r.class
    delete r.style
    // Merge non-class/style keys from active/inactive
    const stateProps = isActive ? resolvedActiveProps : resolvedInactiveProps
    for (const k of Object.keys(stateProps)) {
      if (k === 'class' || k === 'style') continue
      r[k] = stateProps[k]
    }
    return r
  })
</script>

{#if _asChild === undefined}
  <a
    bind:this={anchorEl}
    href={disabled ? undefined : href}
    {target}
    {rel}
    role={disabled ? 'link' : undefined}
    aria-disabled={disabled ? 'true' : undefined}
    data-status={isActive ? 'active' : undefined}
    aria-current={isActive ? 'page' : undefined}
    class={mergedClass}
    style={mergedStyle}
    onclick={handleClick}
    onfocus={handleFocus}
    onmouseenter={handleMouseEnter}
    onmouseover={handleMouseEnter}
    ontouchstart={handleTouchStart}
    {...remainingRest}
  >
    {#if children}
      {@render children({ isActive })}
    {/if}
  </a>
{:else if typeof _asChild === 'string'}
  <svelte:element
    this={_asChild}
    bind:this={anchorEl}
    href={disabled ? undefined : href}
    {target}
    {rel}
    {disabled}
    role={disabled ? 'link' : undefined}
    aria-disabled={disabled ? 'true' : undefined}
    data-status={isActive ? 'active' : undefined}
    aria-current={isActive ? 'page' : undefined}
    class={mergedClass}
    style={mergedStyle}
    onclick={handleClick}
    onfocus={handleFocus}
    onmouseenter={handleMouseEnter}
    onmouseover={handleMouseEnter}
    ontouchstart={handleTouchStart}
    {...remainingRest}
  >
    {#if children}
      {@render children({ isActive })}
    {/if}
  </svelte:element>
{:else}
  {@const C = _asChild as Component<any>}
  <C
    href={disabled ? undefined : href}
    {target}
    {rel}
    {disabled}
    role={disabled ? 'link' : undefined}
    aria-disabled={disabled ? 'true' : undefined}
    data-status={isActive ? 'active' : undefined}
    aria-current={isActive ? 'page' : undefined}
    class={mergedClass}
    style={mergedStyle}
    onclick={handleClick}
    onfocus={handleFocus}
    onmouseenter={handleMouseEnter}
    onmouseover={handleMouseEnter}
    ontouchstart={handleTouchStart}
    {...remainingRest}
  >
    {#if children}
      {@render children({ isActive })}
    {/if}
  </C>
{/if}
