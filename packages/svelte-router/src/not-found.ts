import { isNotFound } from '@tanstack/router-core'
import type { NotFoundError } from '@tanstack/router-core'

/**
 * Unwrap a notFound error. Some frameworks (e.g. Solid) wrap non-Error throws,
 * exposing the original on `cause`. This helper handles both cases.
 */
export function getNotFound(
  error: unknown,
): (NotFoundError & { isNotFound: true }) | undefined {
  if (isNotFound(error)) {
    return error as NotFoundError & { isNotFound: true }
  }
  if (isNotFound((error as any)?.cause)) {
    return (error as any).cause as NotFoundError & { isNotFound: true }
  }
  return undefined
}
