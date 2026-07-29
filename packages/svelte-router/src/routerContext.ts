import type { AnyRouter } from '@tanstack/router-core'

export const routerContextKey = Symbol('tsr.routerContext') as symbol & {
  __brand: 'tsr.routerContext'
  __value: AnyRouter
}

// Seeded by the SSR scaffolds (RouterServer / RouterClient), which already
// render a `<HeadContent />`. It lets `HeadContent` render at most once per
// tree: the first instance claims the slot, any later instance (e.g. a user who
// also placed `<HeadContent />` in their root route) becomes a no-op. Without
// this, a second instance would emit a duplicate set of `<meta>` tags (Svelte
// special-cases `<title>` but not `<meta>`). Absent in pure SPA mode, where
// `HeadContent` always renders.
export const headSlotContextKey = Symbol('tsr.headSlot') as symbol & {
  __brand: 'tsr.headSlot'
  __value: { used: boolean }
}
