/**
 * Route-aware typing of the `Link`, `Navigate` and `MatchRoute` components,
 * checked by svelte-check (which types `.svelte` imports precisely). A Svelte
 * 5 component is callable as `(internals, props)`, so each call below types
 * its props exactly as markup would.
 */
import { Link, MatchRoute, Navigate } from '../../src'
import './register'

declare const internals: any
declare const snippet: any

Link(internals, { to: '/' })
Link(internals, { to: '/posts/$postId', params: { postId: '1' } })
Link(internals, {
  to: '/invoices/$invoiceId',
  params: { invoiceId: '1' },
  search: { page: 1 },
})
Link(internals, { from: '/posts', to: './$postId', params: { postId: '1' } })

// @ts-expect-error unknown route
Link(internals, { to: '/this-route-does-not-exist' })
// @ts-expect-error missing required param
Link(internals, { to: '/posts/$postId' })
// @ts-expect-error wrong param name
Link(internals, { to: '/posts/$postId', params: { id: '1' } })
Link(internals, {
  to: '/invoices/$invoiceId',
  params: { invoiceId: '1' },
  // @ts-expect-error search value has the wrong type
  search: { page: 'x' },
})
// @ts-expect-error unknown anchor attribute
Link(internals, { to: '/', notAnAttribute: true })

Navigate(internals, { to: '/posts' })
// @ts-expect-error unknown route
Navigate(internals, { to: '/nope' })

MatchRoute(internals, { to: '/posts', children: snippet })
// @ts-expect-error unknown route
MatchRoute(internals, { to: '/nope' })
