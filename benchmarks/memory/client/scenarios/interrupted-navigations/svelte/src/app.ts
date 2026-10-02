import { mount, unmount } from 'svelte'
import { RouterProvider } from '@tanstack/svelte-router'
import { getRouter } from './router'
import type {} from '@tanstack/router-core'

export {
  resolveAllSlowLoaders,
  resolveSlowLoader,
  slowLoaderRegistry,
} from '../../slow-loaders'

export function mountTestApp(container: Element) {
  const router = getRouter()
  const svelteApp = mount(RouterProvider, {
    target: container,
    props: { router },
  })
  let didUnmount = false

  // Full teardown mirrors the mount-unmount scenario: guard double-unmounts,
  // release the devtools global, and detach history listeners.
  return {
    router,
    unmount() {
      if (didUnmount) {
        return
      }

      didUnmount = true
      void unmount(svelteApp)

      if (typeof self !== 'undefined' && self.__TSR_ROUTER__ === router) {
        self.__TSR_ROUTER__ = undefined
      }

      router.history.destroy()
    },
  }
}
