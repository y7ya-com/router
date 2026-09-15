import {
  getElementScrollRestorationEntry,
  setupScrollRestoration,
} from '@tanstack/router-core'
import { useRouter } from './useRouter.js'
import type {
  ParsedLocation,
  ScrollRestorationEntry,
} from '@tanstack/router-core'

export function useElementScrollRestoration(
  options: (
    | {
        id: string
        getElement?: () => Window | Element | undefined | null
      }
    | {
        id?: string
        getElement: () => Window | Element | undefined | null
      }
  ) & {
    getKey?: (location: ParsedLocation) => string
  },
): ScrollRestorationEntry | undefined {
  const router = useRouter()
  setupScrollRestoration(router, true)
  return getElementScrollRestorationEntry(router, options)
}
