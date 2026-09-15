import { useRouterSelector } from './utils.js'
import { useRouter } from './useRouter.js'

export function useCanGoBack(): { readonly current: boolean } {
  const router = useRouter()
  return useRouterSelector(
    router,
    router.stores.location,
    (loc: any) => loc.state.__TSR_index !== 0,
  ) as { readonly current: boolean }
}
