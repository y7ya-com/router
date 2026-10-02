import {
  SEMANTIC_ATTRIBUTE_SENTRY_OP,
  SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN,
  SEMANTIC_ATTRIBUTE_SENTRY_SOURCE,
  WINDOW,
  browserTracingIntegration,
  getClient,
  startBrowserTracingNavigationSpan,
  startBrowserTracingPageLoadSpan,
} from '@sentry/svelte'
import type { AnyRouteMatch, AnyRouter } from '@tanstack/svelte-router'

type BrowserTracingOptions = NonNullable<
  Parameters<typeof browserTracingIntegration>[0]
>
type Client = NonNullable<ReturnType<typeof getClient>>

/**
 * A browser tracing integration for TanStack Router, built on the
 * framework-agnostic `@sentry/svelte` tracing primitives.
 */
export function tanstackRouterBrowserTracingIntegration(
  router: AnyRouter,
  options: BrowserTracingOptions = {},
) {
  const browserTracingIntegrationInstance = browserTracingIntegration({
    ...options,
    instrumentNavigation: false,
    instrumentPageLoad: false,
  })

  const { instrumentPageLoad = true, instrumentNavigation = true } = options

  return {
    ...browserTracingIntegrationInstance,
    afterAllSetup(client: Client) {
      browserTracingIntegrationInstance.afterAllSetup(client)

      const initialWindowLocation = WINDOW.location
      if (instrumentPageLoad && initialWindowLocation) {
        const matchedRoutes = router.matchRoutes(
          initialWindowLocation.pathname,
          router.options.parseSearch(initialWindowLocation.search),
          { throwOnError: false },
        )

        const lastMatch = matchedRoutes[matchedRoutes.length - 1]

        startBrowserTracingPageLoadSpan(client, {
          name: lastMatch ? lastMatch.routeId : initialWindowLocation.pathname,
          attributes: {
            [SEMANTIC_ATTRIBUTE_SENTRY_OP]: 'pageload',
            [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]:
              'auto.pageload.svelte.tanstack_router',
            [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: lastMatch ? 'route' : 'url',
            ...routeMatchToParamSpanAttributes(lastMatch),
          },
        })
      }

      if (instrumentNavigation) {
        router.subscribe('onBeforeNavigate', (onBeforeNavigateArgs) => {
          // Pageloads have no fromLocation; same-state navigations are not new
          // navigations.
          if (
            !onBeforeNavigateArgs.fromLocation ||
            onBeforeNavigateArgs.toLocation.state ===
              onBeforeNavigateArgs.fromLocation.state
          ) {
            return
          }

          const onBeforeNavigateMatchedRoutes = router.matchRoutes(
            onBeforeNavigateArgs.toLocation.pathname,
            onBeforeNavigateArgs.toLocation.search,
            { throwOnError: false },
          )

          const onBeforeNavigateLastMatch =
            onBeforeNavigateMatchedRoutes[
              onBeforeNavigateMatchedRoutes.length - 1
            ]

          const navigationSpan = startBrowserTracingNavigationSpan(client, {
            name: onBeforeNavigateLastMatch
              ? onBeforeNavigateLastMatch.routeId
              : WINDOW.location?.pathname ||
                onBeforeNavigateArgs.toLocation.pathname,
            attributes: {
              [SEMANTIC_ATTRIBUTE_SENTRY_OP]: 'navigation',
              [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]:
                'auto.navigation.svelte.tanstack_router',
              [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: onBeforeNavigateLastMatch
                ? 'route'
                : 'url',
            },
          })

          // A redirect during navigation resolves to a different route.
          const unsubscribeOnResolved = router.subscribe(
            'onResolved',
            (onResolvedArgs) => {
              unsubscribeOnResolved()
              if (!navigationSpan) {
                return
              }
              const onResolvedMatchedRoutes = router.matchRoutes(
                onResolvedArgs.toLocation.pathname,
                onResolvedArgs.toLocation.search,
                { throwOnError: false },
              )

              const onResolvedLastMatch =
                onResolvedMatchedRoutes[onResolvedMatchedRoutes.length - 1]

              if (onResolvedLastMatch) {
                navigationSpan.updateName(onResolvedLastMatch.routeId)
                navigationSpan.setAttribute(
                  SEMANTIC_ATTRIBUTE_SENTRY_SOURCE,
                  'route',
                )
                navigationSpan.setAttributes(
                  routeMatchToParamSpanAttributes(onResolvedLastMatch),
                )
              }
            },
          )
        })
      }
    },
  }
}

function routeMatchToParamSpanAttributes(
  match: AnyRouteMatch | undefined,
): Record<string, string> {
  if (!match) {
    return {}
  }

  const paramAttributes: Record<string, string> = {}
  Object.entries(match.params as Record<string, string>).forEach(
    ([key, value]) => {
      paramAttributes[`url.path.parameter.${key}`] = value
      // params.[key] is an alias
      paramAttributes[`params.${key}`] = value
    },
  )

  return paramAttributes
}
