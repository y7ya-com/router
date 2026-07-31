/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion --
   Svelte's `getContext()` is untyped (it returns `unknown`), and `svelte-check`
   resolves it to `{}` where plain `tsc` infers something narrower. The rule
   therefore reports these assertions as redundant, but removing them breaks
   `pnpm test:types`. Keep them; do not let `eslint --fix` strip them. */
import { getContext } from 'svelte'
import { useSelector } from '@tanstack/svelte-store'
import { invariant } from '@tanstack/router-core'
import { useRouter } from './useRouter'
import {
  defaultNearestMatchContext,
  nearestMatchContextKey,
} from './matchContext'
import type { NearestMatchContextValue } from './matchContext'
import type {
  AnyRouter,
  MakeRouteMatch,
  MakeRouteMatchUnion,
  RegisteredRouter,
  StrictOrFrom,
  ThrowConstraint,
  ThrowOrOptional,
} from '@tanstack/router-core'

export interface UseMatchBaseOptions<
  TRouter extends AnyRouter,
  TFrom,
  TStrict extends boolean,
  TThrow extends boolean,
  TSelected,
> {
  select?: (
    match: MakeRouteMatch<TRouter['routeTree'], TFrom, TStrict>,
  ) => TSelected
  shouldThrow?: TThrow
}

export type UseMatchRoute<out TFrom> = <
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = unknown,
>(
  opts?: UseMatchBaseOptions<TRouter, TFrom, true, true, TSelected>,
) => { readonly current: UseMatchResult<TRouter, TFrom, true, TSelected> }

export type UseMatchOptions<
  TRouter extends AnyRouter,
  TFrom extends string | undefined,
  TStrict extends boolean,
  TThrow extends boolean,
  TSelected,
> = StrictOrFrom<TRouter, TFrom, TStrict> &
  UseMatchBaseOptions<TRouter, TFrom, TStrict, TThrow, TSelected>

export type UseMatchResult<
  TRouter extends AnyRouter,
  TFrom,
  TStrict extends boolean,
  TSelected,
> = unknown extends TSelected
  ? TStrict extends true
    ? MakeRouteMatch<TRouter['routeTree'], TFrom, TStrict>
    : MakeRouteMatchUnion<TRouter>
  : TSelected

export function useMatch<
  TRouter extends AnyRouter = RegisteredRouter,
  const TFrom extends string | undefined = undefined,
  TStrict extends boolean = true,
  TThrow extends boolean = true,
  TSelected = unknown,
>(
  opts: UseMatchOptions<
    TRouter,
    TFrom,
    TStrict,
    ThrowConstraint<TStrict, TThrow>,
    TSelected
  >,
): {
  readonly current: ThrowOrOptional<
    UseMatchResult<TRouter, TFrom, TStrict, TSelected>,
    TThrow
  >
} {
  const safeOpts = (opts ?? {}) as typeof opts
  const router = useRouter<TRouter>()
  const nearestMatch =
    safeOpts.from
      ? undefined
      : ((getContext(nearestMatchContextKey) as
          | NearestMatchContextValue
          | undefined) ?? defaultNearestMatchContext)

  if (safeOpts.from) {
    const store = router.stores.getRouteMatchStore(safeOpts.from as string)

    // Phase 1 — synchronous check at hook-call time is the ONLY throw site
    // The reactive selector below must never throw,
    // otherwise a transiently-undefined match during a navigation / view
    // transition would crash instead of resolving to the next match.
    const initial = store.get()
    if (
      initial === undefined &&
      !router.stores.pendingRouteIds.get()[safeOpts.from as string] &&
      !router.stores.isTransitioning.get() &&
      (safeOpts.shouldThrow ?? true)
    ) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error(
          `Invariant failed: Could not find an active match from "${safeOpts.from}"`,
        )
      }
      invariant()
    }

    // Phase 2 — reactive selector. Never throws; keeps the previous value while
    // the route is pending or the router is transitioning, else `undefined`.
    let prev =
      initial !== undefined
        ? ((safeOpts.select ? safeOpts.select(initial as any) : initial) as
            | TSelected
            | undefined)
        : undefined
    const sel = useSelector(store, (m) => {
      if (m === undefined) {
        const hasPendingMatch =
          !!router.stores.pendingRouteIds.get()[safeOpts.from as string]
        if (
          prev !== undefined &&
          (hasPendingMatch || router.stores.isTransitioning.get())
        ) {
          return prev
        }
        return undefined
      }
      prev = (safeOpts.select ? safeOpts.select(m as any) : m) as
        | TSelected
        | undefined
      return prev
    })
    return sel as { readonly current: any }
  }

  // From-context case: read via nearestMatch.match() which is reactive.
  // Compute initial value synchronously so consumers reading `.current` on
  // first render see the right shape (avoids `.current.x` crashes before
  // the effect first fires).
  const initialMatch = nearestMatch!.match()

  // Phase 1 — synchronous throw check (the only throw site; see the `from`
  // branch above for why the reactive effect must not throw).
  if (
    initialMatch === undefined &&
    !nearestMatch!.hasPending() &&
    !router.stores.isTransitioning.get() &&
    (safeOpts.shouldThrow ?? true)
  ) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error('Invariant failed: Could not find a nearest match!')
    }
    invariant()
  }

  let value = $state<unknown>(
    initialMatch !== undefined
      ? safeOpts.select
        ? safeOpts.select(initialMatch as any)
        : initialMatch
      : undefined,
  )
  // Phase 2 — reactive effect. Never throws; keeps the previous value while the
  // nearest match is pending or the router is transitioning, else `undefined`.
  $effect(() => {
    const m = nearestMatch!.match()
    if (m === undefined) {
      if (
        value !== undefined &&
        (nearestMatch!.hasPending() || router.stores.isTransitioning.get())
      ) {
        return
      }
      value = undefined
      return
    }
    value = safeOpts.select ? safeOpts.select(m as any) : m
  })
  return {
    get current() {
      return value as any
    },
  }
}
