import { isServer } from '@tanstack/router-core/isServer'
import { useSelector } from '@tanstack/svelte-store'
import { useRouter } from './useRouter'
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
>(opts?: UseRouterStateOptions<TRouter, TSelected>): {
  readonly current: UseRouterStateResult<TRouter, TSelected>
} {
  const contextRouter = useRouter<TRouter>({
    warn: opts?.router === undefined,
  })
  const router = opts?.router || contextRouter

  const _isServer = isServer ?? router.isServer

  if (_isServer) {
    const state = router.stores.__store.get() as RouterState<
      TRouter['routeTree']
    >
    const selected = (
      opts?.select ? opts.select(state) : state
    ) as UseRouterStateResult<TRouter, TSelected>
    return {
      get current() {
        return selected
      },
    }
  }

  return useSelector(
    router.stores.__store,
    (opts?.select ?? ((s) => s)) as (state: any) => any,
  ) as { readonly current: UseRouterStateResult<TRouter, TSelected> }
}
