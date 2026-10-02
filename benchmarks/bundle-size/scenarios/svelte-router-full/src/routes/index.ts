import {
  createFileRoute,
  retainSearchParams,
  stripSearchParams,
} from '@tanstack/svelte-router'

const defaultSearch = { page: 1 }

export const Route = createFileRoute('/')({
  search: {
    middlewares: [
      retainSearchParams<Record<string, unknown>>(['persist']),
      stripSearchParams(defaultSearch),
    ],
  },
})
