<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'

  export const Route = createRootRoute({})
</script>

<script lang="ts">
  import {
    Asset,
    Await,
    Block,
    CatchBoundary,
    CatchNotFound,
    ClientOnly,
    DefaultGlobalNotFound,
    ErrorComponent,
    HeadContent,
    Link,
    Match,
    MatchRoute,
    Matches,
    Navigate,
    Outlet,
    RouterContextProvider,
    ScriptOnce,
    Scripts,
    ScrollRestoration,
    createLink,
    linkOptions,
    useAwaited,
    useBlocker,
    useCanGoBack,
    useChildMatches,
    useElementScrollRestoration,
    useLinkProps,
    useLoaderData,
    useLoaderDeps,
    useLocation,
    useMatch,
    useMatchRoute,
    useMatches,
    useNavigate,
    useParams,
    useParentMatches,
    useRouteContext,
    useRouter,
    useRouterState,
    useSearch,
    useTags,
  } from '@tanstack/svelte-router'

  const router = useRouter()
  let awaited: unknown
  try {
    ;[awaited] = useAwaited({ promise: Promise.resolve('ready') })
  } catch {
    awaited = undefined
  }
  const linkProps = useLinkProps(() => ({ to: '/' }) as any)
  const matchRoute = useMatchRoute()
  const matches = useMatches()
  const parentMatches = useParentMatches()
  const childMatches = useChildMatches()
  const match = useMatch({ strict: false, shouldThrow: false } as any)
  const loaderDeps = useLoaderDeps({ strict: false } as any)
  const loaderData = useLoaderData({ strict: false } as any)
  const params = useParams({ strict: false } as any)
  const search = useSearch({ strict: false } as any)
  const routeContext = useRouteContext({ strict: false } as any)
  const routerState = useRouterState({
    select: (state) => state.status,
  } as any)
  const location = useLocation()
  const canGoBack = useCanGoBack()
  const navigate = useNavigate()
  const scrollEntry = useElementScrollRestoration({ id: 'root-scroll' })
  const tags = useTags()

  useBlocker({
    shouldBlockFn: () => false,
    disabled: true,
    withResolver: false,
  })

  const linkFactoryResult = linkOptions({ to: '/' } as any)
  const routeMatchResult = matchRoute({ to: '/' } as any)
  const SvgLink = createLink('svg')

  const hooksAndComponents = [
    useAwaited,
    useLinkProps,
    useMatchRoute,
    useMatches,
    useParentMatches,
    useChildMatches,
    useMatch,
    useLoaderDeps,
    useLoaderData,
    useBlocker,
    useNavigate,
    useParams,
    useSearch,
    useRouteContext,
    useRouter,
    useRouterState,
    useLocation,
    useCanGoBack,
    useElementScrollRestoration,
    useTags,
    Await,
    CatchBoundary,
    CatchNotFound,
    ClientOnly,
    DefaultGlobalNotFound,
    ErrorComponent,
    Link,
    Match,
    MatchRoute,
    Matches,
    Navigate,
    Outlet,
    RouterContextProvider,
    ScrollRestoration,
    Block,
    ScriptOnce,
    Asset,
    HeadContent,
    Scripts,
  ]

  ;(globalThis as any).__TANSTACK_BUNDLE_SIZE_KEEP__ = {
    hooksAndComponents,
  }

  $effect(() => {
    void awaited
    void linkFactoryResult
    void matches.current
    void parentMatches.current
    void childMatches.current
    void match.current
    void loaderDeps.current
    void loaderData.current
    void params.current
    void search.current
    void routeContext.current
    void routerState.current
    void location.current
    void canGoBack.current
    void navigate
    void scrollEntry
    void tags.current
    void routeMatchResult.current
  })
</script>

<HeadContent />
<ScriptOnce children={'window.__tsr_bundle_size = true'} />
<Asset
  tag="meta"
  attrs={{ name: 'bundle-size', content: 'svelte-router-full' }}
/>
<a {...linkProps.attrs}>home</a>
<Link to="/">home</Link>
<SvgLink to="/" aria-label="svg-home">
  <circle cx="8" cy="8" r="7" />
</SvgLink>
<MatchRoute to="/">
  <span data-test="match-route"></span>
</MatchRoute>
<ClientOnly>
  <span data-test="client-only"></span>
  {#snippet fallback()}
    <span data-test="client-only-fallback"></span>
  {/snippet}
</ClientOnly>
<Await promise={Promise.resolve('done')}>
  {#snippet children()}
    <span data-test="await"></span>
  {/snippet}
</Await>
<Block shouldBlockFn={() => false} disabled withResolver={false}>
  <span data-test="block"></span>
</Block>
<CatchNotFound>
  <span data-test="catch-not-found"></span>
  {#snippet fallback()}
    <DefaultGlobalNotFound />
  {/snippet}
</CatchNotFound>
<RouterContextProvider {router}>
  <span data-test="nested-router-context"></span>
</RouterContextProvider>
<ScrollRestoration />
<Outlet />
<Scripts />
<div data-test="full-root">
  <div>hello world</div>
</div>
