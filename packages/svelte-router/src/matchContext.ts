import type { AnyRouteMatch } from '@tanstack/router-core'

export type NearestMatchContextValue = {
  routeId: () => string | undefined
  match: () => AnyRouteMatch | undefined
}

export const defaultNearestMatchContext: NearestMatchContextValue = {
  routeId: () => undefined,
  match: () => undefined,
}

export const nearestMatchContextKey = Symbol(
  'tsr.nearestMatchContext',
) as symbol & { __brand: 'tsr.nearestMatchContext' }
