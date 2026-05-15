import { useMatch } from './useMatch.svelte'
import type {
  AnyRouter,
  RegisteredRouter,
  UseRouteContextBaseOptions,
  UseRouteContextOptions,
  UseRouteContextResult,
} from '@tanstack/router-core'

export type UseRouteContextRoute<out TFrom> = <
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = unknown,
>(
  opts?: UseRouteContextBaseOptions<TRouter, TFrom, true, TSelected>,
) => { readonly current: UseRouteContextResult<TRouter, TFrom, true, TSelected> }

export function useRouteContext<
  TRouter extends AnyRouter = RegisteredRouter,
  const TFrom extends string | undefined = undefined,
  TStrict extends boolean = true,
  TSelected = unknown,
>(
  opts: UseRouteContextOptions<TRouter, TFrom, TStrict, TSelected>,
): { readonly current: UseRouteContextResult<TRouter, TFrom, TStrict, TSelected> } {
  const o = (opts ?? {}) as any
  return useMatch({
    ...o,
    select: (match: any) =>
      o.select ? o.select(match.context) : match.context,
  }) as any
}
