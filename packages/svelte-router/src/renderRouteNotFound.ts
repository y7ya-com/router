import type {
  AnyRoute,
  AnyRouter,
  NotFoundError,
} from '@tanstack/router-core'

/**
 * Pick the appropriate not-found component for the given route + error and return it.
 * The caller is responsible for rendering it.
 */
export function renderRouteNotFound(
  router: AnyRouter,
  route: AnyRoute,
  error: NotFoundError | undefined,
):
  | { component: any; props: Record<string, unknown> }
  | undefined {
  const comp =
    route.options.notFoundComponent ??
    router.options.defaultNotFoundComponent

  if (!comp) return undefined

  return { component: comp, props: { ...(error ?? {}) } }
}
