import { createFileRoute } from '@tanstack/svelte-router'
import { errorMessage } from '../../../shared'
import BrokenError from '../components/BrokenError.svelte'

export const Route = createFileRoute('/broken')({
  staleTime: 0,
  gcTime: 0,
  loader: () => {
    throw new Error(errorMessage)
  },
  errorComponent: BrokenError,
})
