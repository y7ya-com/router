import { deepEqual } from '@tanstack/router-core'
import { useRouterSelector } from './utils.js'
import { useRouter } from './useRouter.js'
import type { ViewTransitionOptions } from '@tanstack/router-core'

export type LinkStateProps = {
  class?: string
  style?: Record<string, unknown> | string
  [key: string]: unknown
}

export type UseLinkPropsOptions = {
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
  state?: unknown
  unsafeRelative?: unknown
  /** Declared by router-core; no framework port acts on it yet. */
  preloadIntentProximity?: number
  hashScrollIntoView?: boolean | ScrollIntoViewOptions
  startTransition?: boolean
  viewTransition?: boolean | ViewTransitionOptions
  /** Everything else — user attributes and handlers, merged into `rest`. */
  [key: string]: unknown
}

const OWN_KEYS = new Set([
  'to',
  'from',
  'params',
  'search',
  'hash',
  'replace',
  'resetScroll',
  'preload',
  'preloadDelay',
  'preloadIntentProximity',
  'hashScrollIntoView',
  'activeOptions',
  'disabled',
  'target',
  'rel',
  'activeProps',
  'inactiveProps',
  'mask',
  'reloadDocument',
  'ignoreBlocker',
  'startTransition',
  'viewTransition',
  'state',
  'unsafeRelative',
  'href',
  'children',
  '_asChild',
])

/**
 * The link computations behind `<Link>`, exposed as a hook. Must be called
 * during component init (it subscribes to the router's location store);
 * `getOptions` is a getter so the computations track the caller's reactive
 * props. Returned values are getters over runes — read them in a template (or
 * a `$derived`) and they stay live. `attrs` is the complete spreadable prop
 * bag: `<a {...link.attrs}>`.
 */
export function useLinkProps(getOptions: () => UseLinkPropsOptions) {
  const router = useRouter()
  const locationSel = useRouterSelector(router, router.stores.location)

  const opts = $derived(getOptions())

  const rest = $derived.by(() => {
    const r: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(opts)) {
      if (!OWN_KEYS.has(k)) {
        r[k] = v
      }
    }
    return r
  })

  const buildOpts = $derived({
    href: opts.href,
    to: opts.to,
    from: opts.from,
    params: opts.params,
    search: opts.search,
    hash: opts.hash,
    replace: opts.replace,
    resetScroll: opts.resetScroll,
    mask: opts.mask,
    unsafeRelative: opts.unsafeRelative,
    state: opts.state,
    ignoreBlocker: opts.ignoreBlocker,
  })

  // Everything `navigate` needs beyond what `buildLocation` takes.
  const navigateOpts = $derived({
    ...buildOpts,
    reloadDocument: opts.reloadDocument,
    hashScrollIntoView: opts.hashScrollIntoView,
    startTransition: opts.startTransition,
    viewTransition: opts.viewTransition,
  })

  const isExternal = $derived(
    typeof opts.to === 'string' && /^(https?:)?\/\//.test(opts.to),
  )

  const href = $derived.by(() => {
    if (isExternal) {
      return opts.to as string
    }
    // Read the location selector so this derived re-runs when navigation
    // changes the current URL/params.
    void locationSel.current
    try {
      const next = router.buildLocation(buildOpts as any) as any
      const location = next.maskedLocation ?? next
      const publicHref = location.publicHref ?? location.href
      if (location.external) {
        return publicHref
      }
      return router.history.createHref(publicHref) || '/'
    } catch {
      return ''
    }
  })

  const effectivePreload = $derived.by(() => {
    if (opts.reloadDocument || opts.disabled || isExternal) {
      return false
    }
    return opts.preload ?? router.options.defaultPreload
  })

  const preloadDelay = $derived(
    opts.preloadDelay ?? router.options.defaultPreloadDelay ?? 0,
  )

  function preload() {
    if (opts.disabled || isExternal) {
      return
    }
    router.preloadRoute(buildOpts as any).catch(() => {})
  }

  // `preloadDelay` debounces intent/viewport preloads: the timer is armed on
  // enter and cleared on leave, so a cursor sweeping across links preloads
  // only the one it settles on.
  let preloadTimeout: ReturnType<typeof setTimeout> | undefined
  function schedulePreload() {
    if (!preloadDelay) {
      preload()
      return
    }
    if (preloadTimeout !== undefined) {
      return
    }
    preloadTimeout = setTimeout(() => {
      preloadTimeout = undefined
      preload()
    }, preloadDelay)
  }
  function cancelPreload() {
    if (preloadTimeout === undefined) {
      return
    }
    clearTimeout(preloadTimeout)
    preloadTimeout = undefined
  }

  function handleClick(e: MouseEvent) {
    if (opts.disabled) {
      e.preventDefault()
      return
    }
    if (isExternal) {
      return
    }
    // Use the actual DOM element's target if the prop wasn't set — this lets
    // a custom `_asChild` component override `target` (e.g. set `_blank`).
    // Read the attribute: on an SVG `<a>` the `target` property is an
    // `SVGAnimatedString`, not a string.
    const effectiveTarget =
      opts.target ??
      ((e.currentTarget as Element | null)?.getAttribute('target') || undefined)
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
    router.navigate(navigateOpts as any)
  }

  function handleIntent() {
    if (effectivePreload !== 'intent') {
      return
    }
    schedulePreload()
  }

  function handleLeave() {
    if (effectivePreload !== 'intent') {
      return
    }
    cancelPreload()
  }

  function handleTouchStart() {
    if (effectivePreload !== 'intent') {
      return
    }
    preload()
  }

  const isActive = $derived.by(() => {
    if (!opts.to) {
      return false
    }
    if (isExternal) {
      return false
    }
    try {
      const nextLocation = router.buildLocation(buildOpts as any) as any
      const current = locationSel.current as any
      const currentPath = current.pathname as string
      const nextPath = nextLocation.pathname as string
      const basepath = (router as any).basepath ?? '/'

      const removeTrailing = (p: string) => {
        const base = basepath === '/' ? '' : basepath
        if (p === '/' || p === base) {
          return base || '/'
        }
        return p.endsWith('/') ? p.slice(0, -1) : p
      }

      if (opts.activeOptions?.exact) {
        const cp = removeTrailing(currentPath)
        const np = removeTrailing(nextPath)
        if (cp !== np) {
          return false
        }
      } else {
        const cp = removeTrailing(currentPath)
        const np = removeTrailing(nextPath)
        const fuzzy =
          cp.startsWith(np) &&
          (cp.length === np.length || cp[np.length] === '/')
        if (!fuzzy) {
          return false
        }
      }

      if (opts.activeOptions?.includeSearch ?? true) {
        const searchTest = deepEqual(
          current.search ?? {},
          nextLocation.search ?? {},
          !opts.activeOptions?.exact,
          opts.activeOptions?.explicitUndefined,
        )
        if (!searchTest) {
          return false
        }
      }

      if (opts.activeOptions?.includeHash) {
        return (current.hash ?? '') === (nextLocation.hash ?? '')
      }
      return true
    } catch {
      return false
    }
  })

  const resolvedActiveProps = $derived(
    typeof opts.activeProps === 'function'
      ? opts.activeProps()
      : opts.activeProps !== undefined
        ? opts.activeProps
        : { class: 'active' },
  )
  const resolvedInactiveProps = $derived(
    typeof opts.inactiveProps === 'function'
      ? opts.inactiveProps()
      : (opts.inactiveProps ?? {}),
  )

  // Merge classes/styles from active+inactive+rest, depending on state
  const mergedClass = $derived.by(() => {
    const parts: Array<string> = []
    const restCls = rest.class as string | undefined
    if (restCls) {
      parts.push(restCls)
    }
    if (isActive && resolvedActiveProps.class) {
      parts.push(resolvedActiveProps.class)
    }
    if (!isActive && resolvedInactiveProps.class) {
      parts.push(resolvedInactiveProps.class)
    }
    return parts.length > 0 ? parts.join(' ') : undefined
  })

  const mergedStyle = $derived.by(() => {
    const parts: Array<string> = []
    const restStyle = rest.style
    if (restStyle) {
      if (typeof restStyle === 'string') {
        parts.push(restStyle)
      } else if (typeof restStyle === 'object') {
        for (const [k, v] of Object.entries(restStyle)) {
          parts.push(`${k}: ${v}`)
        }
      }
    }
    const stateStyle = isActive
      ? resolvedActiveProps.style
      : resolvedInactiveProps.style
    if (stateStyle) {
      if (typeof stateStyle === 'string') {
        parts.push(stateStyle)
      } else if (typeof stateStyle === 'object') {
        for (const [k, v] of Object.entries(stateStyle)) {
          parts.push(`${k}: ${v}`)
        }
      }
    }
    return parts.length > 0 ? parts.join('; ') : undefined
  })

  const remainingRest = $derived.by(() => {
    const r: Record<string, unknown> = { ...rest }
    delete r.class
    delete r.style
    // Merge non-class/style keys from active/inactive
    const stateProps = isActive ? resolvedActiveProps : resolvedInactiveProps
    for (const k of Object.keys(stateProps)) {
      if (k === 'class' || k === 'style') {
        continue
      }
      r[k] = stateProps[k]
    }
    return r
  })

  // A user-supplied `onclick` (etc.) lands in `remainingRest`, and in Svelte a
  // later spread overrides an earlier attribute — so spreading `remainingRest`
  // after our handlers would silently replace them and break navigation.
  // Instead the composed handlers are applied *after* the spread and call the
  // user's handler first: if the user
  // calls `preventDefault()`, ours is skipped. These wrappers are created once
  // (they read `remainingRest` at call time), so handlers aren't re-attached on
  // every active/inactive change.
  const composeHandler = (key: string, own: (e: any) => void) => (e: Event) => {
    if (e.defaultPrevented) {
      return
    }
    const user = remainingRest[key] as ((e: Event) => void) | undefined
    if (typeof user === 'function') {
      user(e)
      if (e.defaultPrevented) {
        return
      }
    }
    own(e)
  }

  const composedHandlers = {
    onclick: composeHandler('onclick', handleClick),
    onfocus: composeHandler('onfocus', handleIntent),
    onblur: composeHandler('onblur', handleLeave),
    onmouseenter: composeHandler('onmouseenter', handleIntent),
    onmouseover: composeHandler('onmouseover', handleIntent),
    onmouseleave: composeHandler('onmouseleave', handleLeave),
    onmouseout: composeHandler('onmouseout', handleLeave),
    ontouchstart: composeHandler('ontouchstart', handleTouchStart),
  }

  return {
    get href() {
      return href
    },
    get isActive() {
      return isActive
    },
    get isExternal() {
      return isExternal
    },
    get effectivePreload() {
      return effectivePreload
    },
    get class() {
      return mergedClass
    },
    get style() {
      return mergedStyle
    },
    get rest() {
      return remainingRest
    },
    handlers: composedHandlers,
    preload,
    schedulePreload,
    cancelPreload,
    /** The complete spreadable prop bag: `<a {...link.attrs}>`. */
    get attrs(): Record<string, unknown> {
      const disabled = opts.disabled
      return {
        href: disabled ? undefined : href,
        target: opts.target,
        rel: opts.rel,
        role: disabled ? 'link' : undefined,
        'aria-disabled': disabled ? 'true' : undefined,
        'data-status': isActive ? 'active' : undefined,
        'aria-current': isActive ? 'page' : undefined,
        class: mergedClass,
        style: mergedStyle,
        ...remainingRest,
        ...composedHandlers,
      }
    },
  }
}
