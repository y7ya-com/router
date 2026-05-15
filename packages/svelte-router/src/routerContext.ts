import type { AnyRouter } from '@tanstack/router-core'

export const routerContextKey = Symbol('tsr.routerContext') as symbol & {
  __brand: 'tsr.routerContext'
  __value: AnyRouter
}
