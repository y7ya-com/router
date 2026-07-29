/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion --
   See the note in `useMatch.svelte.ts`: `getContext()` types differently under
   `svelte-check` than under plain `tsc`, so these assertions are load-bearing
   even though the rule reports them as redundant. */
import { getContext } from 'svelte'
import { useSelector } from '@tanstack/svelte-store'
import { useRouter } from './useRouter'
import {
  defaultNearestMatchContext,
  nearestMatchContextKey,
} from './matchContext'
import type { NearestMatchContextValue } from './matchContext'
import type {
  AnyRouter,
  DeepPartial,
  Expand,
  MakeOptionalPathParams,
  MakeOptionalSearchParams,
  MakeRouteMatchUnion,
  MaskOptions,
  MatchRouteOptions,
  RegisteredRouter,
  ResolveRoute,
  ToSubOptionsProps,
} from '@tanstack/router-core'

export interface UseMatchesBaseOptions<TRouter extends AnyRouter, TSelected> {
  select?: (matches: Array<MakeRouteMatchUnion<TRouter>>) => TSelected
}

export type UseMatchesResult<
  TRouter extends AnyRouter,
  TSelected,
> = unknown extends TSelected ? Array<MakeRouteMatchUnion<TRouter>> : TSelected

export function useMatches<
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = unknown,
>(
  opts?: UseMatchesBaseOptions<TRouter, TSelected>,
): { readonly current: UseMatchesResult<TRouter, TSelected> } {
  const router = useRouter<TRouter>()
  return useSelector(router.stores.matches, (matches: any) => {
    return opts?.select ? opts.select(matches) : matches
  }) as { readonly current: UseMatchesResult<TRouter, TSelected> }
}

export function useParentMatches<
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = unknown,
>(
  opts?: UseMatchesBaseOptions<TRouter, TSelected>,
): { readonly current: UseMatchesResult<TRouter, TSelected> } {
  const ctx =
    (getContext(nearestMatchContextKey) as
      | NearestMatchContextValue
      | undefined) ?? defaultNearestMatchContext

  return useMatches({
    select: (matches: Array<MakeRouteMatchUnion<TRouter>>) => {
      const contextMatchId = ctx.matchId()
      const sliced = matches.slice(
        0,
        matches.findIndex((d) => d.id === contextMatchId),
      )
      return opts?.select ? opts.select(sliced) : sliced
    },
  } as any) as { readonly current: UseMatchesResult<TRouter, TSelected> }
}

export function useChildMatches<
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = unknown,
>(
  opts?: UseMatchesBaseOptions<TRouter, TSelected>,
): { readonly current: UseMatchesResult<TRouter, TSelected> } {
  const ctx =
    (getContext(nearestMatchContextKey) as
      | NearestMatchContextValue
      | undefined) ?? defaultNearestMatchContext

  return useMatches({
    select: (matches: Array<MakeRouteMatchUnion<TRouter>>) => {
      const contextMatchId = ctx.matchId()
      const sliced = matches.slice(
        matches.findIndex((d) => d.id === contextMatchId) + 1,
      )
      return opts?.select ? opts.select(sliced) : sliced
    },
  } as any) as { readonly current: UseMatchesResult<TRouter, TSelected> }
}

export type UseMatchRouteOptions<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends string = string,
  TTo extends string | undefined = undefined,
  TMaskFrom extends string = TFrom,
  TMaskTo extends string = '',
> = ToSubOptionsProps<TRouter, TFrom, TTo> &
  DeepPartial<MakeOptionalSearchParams<TRouter, TFrom, TTo>> &
  DeepPartial<MakeOptionalPathParams<TRouter, TFrom, TTo>> &
  MaskOptions<TRouter, TMaskFrom, TMaskTo> &
  MatchRouteOptions

export function useMatchRoute<
  TRouter extends AnyRouter = RegisteredRouter,
>() {
  const router = useRouter()

  return <
    const TFrom extends string = string,
    const TTo extends string | undefined = undefined,
    const TMaskFrom extends string = TFrom,
    const TMaskTo extends string = '',
  >(
    opts: UseMatchRouteOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo>,
  ): {
    readonly current:
      | false
      | Expand<ResolveRoute<TRouter, TFrom, TTo>['types']['allParams']>
  } => {
    const { pending, caseSensitive, fuzzy, includeSearch, ...rest } = opts
    return useSelector(router.stores.matchRouteDeps, () => {
      return router.matchRoute(rest as any, {
        pending,
        caseSensitive,
        fuzzy,
        includeSearch,
      })
    }) as any
  }
}

export type MakeMatchRouteOptions<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends string = string,
  TTo extends string | undefined = undefined,
  TMaskFrom extends string = TFrom,
  TMaskTo extends string = '',
> = UseMatchRouteOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo>
