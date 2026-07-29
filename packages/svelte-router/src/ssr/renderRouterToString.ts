import { render } from 'svelte/server'
import RouterServer from './RouterServer.svelte'
import type { AnyRouter } from '@tanstack/router-core'
import type { Component } from 'svelte'

export const renderRouterToString = ({
  router,
  responseHeaders,
  children,
}: {
  router: AnyRouter
  responseHeaders: Headers
  children?: () => unknown
}) => {
  try {
    // `children` is part of the cross-framework handler contract (react/solid
    // pass the user's document shell here). Svelte can't take a rendered tree
    // as a value, so the shell is `RouterServer` and this arg is accepted but
    // unused — see the note on the SSR shell gap in the adapter README.
    const RootComponent = RouterServer as Component<Record<string, any>>

    // Destructure `body`, NOT `html`: the two are identical in sync mode, but
    // under `experimental.async` Svelte replaces `html` with a getter that
    // throws (`html_deprecated`). Using `body` keeps this working if/when the
    // adapter opts into async SSR.
    const { head, body: html } = render(RootComponent, { props: { router } })

    router.serverSsr!.setRenderFinished()
    let body = `<!DOCTYPE html><html><head>${head}</head><body>${html}`
    const injectedHtml = router.serverSsr!.takeBufferedHtml()
    if (injectedHtml) {
      body += injectedHtml
    }
    body += '</body></html>'

    return new Response(body, {
      status: router.stores.statusCode.get(),
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Render to string error:', error)
    return new Response('Internal Server Error', {
      status: 500,
      headers: responseHeaders,
    })
  } finally {
    router.serverSsr?.cleanup()
  }
}
