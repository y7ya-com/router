import { useSelector } from '@tanstack/svelte-store'
import { useRouter } from './useRouter'
import type {
  AnyRouter,
  RegisteredRouter,
  RouterState,
} from '@tanstack/router-core'

export interface UseLocationBaseOptions<TRouter extends AnyRouter, TSelected> {
  select?: (state: RouterState<TRouter['routeTree']>['location']) => TSelected
}

export type UseLocationResult<
  TRouter extends AnyRouter,
  TSelected,
> = unknown extends TSelected
  ? RouterState<TRouter['routeTree']>['location']
  : TSelected

export function useLocation<
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = unknown,
>(opts?: UseLocationBaseOptions<TRouter, TSelected>): {
  readonly current: UseLocationResult<TRouter, TSelected>
} {
  const router = useRouter<TRouter>()
  return useSelector(
    router.stores.location,
    (opts?.select ?? ((s: any) => s)) as (state: any) => any,
  ) as { readonly current: UseLocationResult<TRouter, TSelected> }
}
