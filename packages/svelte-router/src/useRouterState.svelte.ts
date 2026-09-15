import { useRouter } from './useRouter.js'
import { useRouterSelector } from './utils.js'
import type {
  AnyRouter,
  RegisteredRouter,
  RouterState,
} from '@tanstack/router-core'

export type UseRouterStateOptions<TRouter extends AnyRouter, TSelected> = {
  router?: TRouter
  select?: (state: RouterState<TRouter['routeTree']>) => TSelected
}

export type UseRouterStateResult<
  TRouter extends AnyRouter,
  TSelected,
> = unknown extends TSelected ? RouterState<TRouter['routeTree']> : TSelected

export function useRouterState<
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = unknown,
>(
  opts?: UseRouterStateOptions<TRouter, TSelected>,
): {
  readonly current: UseRouterStateResult<TRouter, TSelected>
} {
  const contextRouter = useRouter<TRouter>({
    warn: opts?.router === undefined,
  })
  const router = opts?.router || contextRouter

  return useRouterSelector(
    router,
    router.stores.__store,
    (opts?.select ?? ((s) => s)) as (state: any) => any,
  ) as { readonly current: UseRouterStateResult<TRouter, TSelected> }
}
