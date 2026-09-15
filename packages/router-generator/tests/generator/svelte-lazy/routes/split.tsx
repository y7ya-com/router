import { createFileRoute } from '@tanstack/svelte-router'

export const Route = createFileRoute('/split')({
  loader: () => 'split',
})
