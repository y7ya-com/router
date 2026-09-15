import { render } from 'svelte/server'
import { renderSsrHtmlResponse } from '@tanstack/router-core/ssr/server'
import RouterServer from './RouterServer.svelte'
import { buildDocument } from './document.js'
import type { AnyRouter } from '@tanstack/router-core'
import type { Component } from 'svelte'

export const renderRouterToString = ({
  router,
  responseHeaders,
}: {
  router: AnyRouter
  responseHeaders: Headers
  children?: () => unknown
}) => {
  return renderSsrHtmlResponse({
    router,
    responseHeaders,
    render: async () => {
      // `children` is part of the cross-framework handler contract. Svelte
      // cannot take a rendered tree as a value, so the shell is
      // `RouterServer`; the root route's `shellComponent`, `htmlAttrs` and
      // `bodyAttrs` customise it.
      const RootComponent = RouterServer as Component<Record<string, any>>
      // `body`, not `html`: under `experimental.async` Svelte turns `html`
      // into a throwing getter.
      const { head, body } = await render(RootComponent, { props: { router } })
      return buildDocument(router, head, body)
    },
  })
}
