import { useSelector } from '@tanstack/svelte-store'
import { useRouter } from './useRouter'

export function useCanGoBack(): { readonly current: boolean } {
  const router = useRouter()
  return useSelector(
    router.stores.location,
    (loc: any) => loc.state.__TSR_index !== 0,
  ) as { readonly current: boolean }
}
