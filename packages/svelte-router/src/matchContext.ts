import type { AnyRouteMatch } from '@tanstack/router-core'

export type NearestMatchContextValue = {
  matchId: () => string | undefined
  routeId: () => string | undefined
  match: () => AnyRouteMatch | undefined
  hasPending: () => boolean
}

export const defaultNearestMatchContext: NearestMatchContextValue = {
  matchId: () => undefined,
  routeId: () => undefined,
  match: () => undefined,
  hasPending: () => false,
}

export const nearestMatchContextKey = Symbol(
  'tsr.nearestMatchContext',
) as symbol & { __brand: 'tsr.nearestMatchContext' }
