import { useRouter } from './useRouter'
import type {
  BlockerFnArgs,
  HistoryAction,
  HistoryLocation,
} from '@tanstack/history'
import type {
  AnyRoute,
  AnyRouter,
  ParseRoute,
  RegisteredRouter,
} from '@tanstack/router-core'

type ShouldBlockFnLocation<
  out TRouteId,
  out TFullPath,
  out TAllParams,
  out TFullSearchSchema,
> = {
  routeId: TRouteId
  fullPath: TFullPath
  pathname: string
  params: TAllParams
  search: TFullSearchSchema
}

type AnyShouldBlockFnLocation = ShouldBlockFnLocation<any, any, any, any>

type MakeShouldBlockFnLocationUnion<
  TRouter extends AnyRouter = RegisteredRouter,
  TRoute extends AnyRoute = ParseRoute<TRouter['routeTree']>,
> = TRoute extends any
  ? ShouldBlockFnLocation<
      TRoute['id'],
      TRoute['fullPath'],
      TRoute['types']['allParams'],
      TRoute['types']['fullSearchSchema']
    >
  : never

export type BlockerResolver<TRouter extends AnyRouter = RegisteredRouter> =
  | {
      status: 'blocked'
      current: MakeShouldBlockFnLocationUnion<TRouter>
      next: MakeShouldBlockFnLocationUnion<TRouter>
      action: HistoryAction
      proceed: () => void
      reset: () => void
    }
  | {
      status: 'idle'
      current: undefined
      next: undefined
      action: undefined
      proceed: undefined
      reset: undefined
    }

type ShouldBlockFnArgs<TRouter extends AnyRouter = RegisteredRouter> = {
  current: MakeShouldBlockFnLocationUnion<TRouter>
  next: MakeShouldBlockFnLocationUnion<TRouter>
  action: HistoryAction
}

export type ShouldBlockFn<TRouter extends AnyRouter = RegisteredRouter> = (
  args: ShouldBlockFnArgs<TRouter>,
) => boolean | Promise<boolean>

export type UseBlockerOpts<
  TRouter extends AnyRouter = RegisteredRouter,
  TWithResolver extends boolean = boolean,
> = {
  shouldBlockFn: ShouldBlockFn<TRouter>
  enableBeforeUnload?: boolean | (() => boolean)
  disabled?: boolean
  withResolver?: TWithResolver
}

type LegacyBlockerFn = () => Promise<any> | any
type LegacyBlockerOpts = {
  blockerFn?: LegacyBlockerFn
  condition?: boolean | any
}

const IDLE: BlockerResolver = {
  status: 'idle',
  current: undefined,
  next: undefined,
  action: undefined,
  proceed: undefined,
  reset: undefined,
}

function _resolveBlockerOpts(
  opts?: UseBlockerOpts | LegacyBlockerOpts | LegacyBlockerFn,
  condition?: boolean | any,
): UseBlockerOpts {
  if (opts === undefined) {
    return { shouldBlockFn: () => true, withResolver: false }
  }

  if (typeof opts === 'function') {
    const shouldBlock = Boolean(condition ?? true)
    const _customBlockerFn = async () => {
      if (shouldBlock) return await opts()
      return false
    }
    return {
      shouldBlockFn: _customBlockerFn,
      enableBeforeUnload: shouldBlock,
      withResolver: false,
    }
  }

  if ('shouldBlockFn' in opts) return opts

  const shouldBlock = Boolean(opts.condition ?? true)
  const _customBlockerFn = async () => {
    if (shouldBlock && opts.blockerFn !== undefined) {
      return await opts.blockerFn()
    }
    return shouldBlock
  }
  return {
    shouldBlockFn: _customBlockerFn,
    enableBeforeUnload: shouldBlock,
    withResolver: opts.blockerFn === undefined,
  }
}

export function useBlocker<
  TRouter extends AnyRouter = RegisteredRouter,
  TWithResolver extends boolean = false,
>(
  opts: UseBlockerOpts<TRouter, TWithResolver>,
): TWithResolver extends true
  ? { readonly current: BlockerResolver<TRouter> }
  : void

/** @deprecated Use the shouldBlockFn property instead */
export function useBlocker(
  blockerFnOrOpts?: LegacyBlockerOpts,
): { readonly current: BlockerResolver }

/** @deprecated Use the UseBlockerOpts object syntax instead */
export function useBlocker(
  blockerFn?: LegacyBlockerFn,
  condition?: boolean | any,
): { readonly current: BlockerResolver }

export function useBlocker(
  opts?: UseBlockerOpts | LegacyBlockerOpts | LegacyBlockerFn,
  condition?: boolean | any,
): { readonly current: BlockerResolver } | void {
  const router = useRouter()

  let resolver = $state<BlockerResolver>(IDLE)

  // Recompute resolved opts inside the effect so reactive `disabled`/etc.
  // properties on `opts` re-register the blocker when they change.
  const withResolver = _resolveBlockerOpts(opts, condition).withResolver ?? false

  $effect(() => {
    const resolved = _resolveBlockerOpts(opts, condition)
    const enableBeforeUnload = resolved.enableBeforeUnload ?? true
    const disabled = resolved.disabled ?? false
    const blockerFnComposed = async (blockerFnArgs: BlockerFnArgs) => {
      function getLocation(
        location: HistoryLocation,
      ): AnyShouldBlockFnLocation {
        const parsedLocation = router.parseLocation(location)
        const matchedRoutes = router.getMatchedRoutes(parsedLocation.pathname)
        if (matchedRoutes.foundRoute === undefined) {
          return {
            routeId: '__notFound__',
            fullPath: parsedLocation.pathname,
            pathname: parsedLocation.pathname,
            params: matchedRoutes.routeParams,
            search: parsedLocation.search,
          }
        }
        return {
          routeId: matchedRoutes.foundRoute.id,
          fullPath: matchedRoutes.foundRoute.fullPath,
          pathname: parsedLocation.pathname,
          params: matchedRoutes.routeParams,
          search: parsedLocation.search,
        }
      }

      const current = getLocation(blockerFnArgs.currentLocation)
      const next = getLocation(blockerFnArgs.nextLocation)

      if (
        current.routeId === '__notFound__' &&
        next.routeId !== '__notFound__'
      ) {
        return false
      }

      const shouldBlock = await resolved.shouldBlockFn({
        action: blockerFnArgs.action,
        current,
        next,
      })
      if (!withResolver) return shouldBlock
      if (!shouldBlock) return false

      const promise = new Promise<boolean>((resolve) => {
        resolver = {
          status: 'blocked',
          current,
          next,
          action: blockerFnArgs.action,
          proceed: () => resolve(false),
          reset: () => resolve(true),
        }
      })
      const canNavigateAsync = await promise
      resolver = IDLE
      return canNavigateAsync
    }

    if (disabled) return
    return router.history.block({
      blockerFn: blockerFnComposed,
      enableBeforeUnload,
    })
  })

  if (!withResolver) return
  return {
    get current() {
      return resolver
    },
  }
}
