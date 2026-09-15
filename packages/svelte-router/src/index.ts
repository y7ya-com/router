export {
  defer,
  isMatch,
  joinPaths,
  cleanPath,
  trimPathLeft,
  trimPathRight,
  trimPath,
  resolvePath,
  interpolatePath,
  rootRouteId,
  defaultParseSearch,
  defaultStringifySearch,
  parseSearchWith,
  stringifySearchWith,
  functionalUpdate,
  replaceEqualDeep,
  deepEqual,
  createControlledPromise,
  retainSearchParams,
  stripSearchParams,
  createSerializationAdapter,
} from '@tanstack/router-core'

export type {
  DeferredPromiseState,
  DeferredPromise,
  ParsedLocation,
  RemoveTrailingSlashes,
  RemoveLeadingSlashes,
  ActiveOptions,
  ResolveRelativePath,
  RootRouteId,
  AnyPathParams,
  ResolveParams,
  ResolveOptionalParams,
  ResolveRequiredParams,
  SearchSchemaInput,
  AnyContext,
  RouteContext,
  PreloadableObj,
  RoutePathOptions,
  StaticDataRouteOption,
  RoutePathOptionsIntersection,
  UpdatableStaticRouteOption,
  MetaDescriptor,
  RouteLinkEntry,
  ParseParamsFn,
  SearchFilter,
  ResolveId,
  InferFullSearchSchema,
  InferFullSearchSchemaInput,
  ErrorRouteProps,
  ErrorComponentProps,
  NotFoundRouteProps,
  TrimPath,
  TrimPathLeft,
  TrimPathRight,
  StringifyParamsFn,
  ParamsOptions,
  InferAllParams,
  InferAllContext,
  LooseReturnType,
  LooseAsyncReturnType,
  ContextReturnType,
  ContextAsyncReturnType,
  ResolveLoaderData,
  ResolveRouteContext,
  SearchSerializer,
  SearchParser,
  TrailingSlashOption,
  Manifest,
  RouterManagedTag,
  ControlledPromise,
  Constrain,
  Expand,
  MergeAll,
  Assign,
  IntersectAssign,
  ResolveValidatorInput,
  ResolveValidatorOutput,
  AnyValidator,
  DefaultValidator,
  ValidatorFn,
  AnySchema,
  AnyValidatorAdapter,
  AnyValidatorFn,
  AnyValidatorObj,
  ResolveValidatorInputFn,
  ResolveValidatorOutputFn,
  ResolveSearchValidatorInput,
  ResolveSearchValidatorInputFn,
  Validator,
  ValidatorAdapter,
  ValidatorObj,
  NavigateFn,
  BuildLocationFn,
  InferDescendantToPaths,
  RelativeToPath,
  RelativeToParentPath,
  RelativeToCurrentPath,
  Register,
  AbsoluteToPath,
  RelativeToPathAutoComplete,
  NavigateOptions,
  ToOptions,
  ToMaskOptions,
  ToSubOptions,
  ResolveRoute,
  SearchParamOptions,
  PathParamOptions,
  ToPathOption,
  LinkOptions,
  MakeOptionalPathParams,
  AnyRouterWithContext,
  ParseRoute,
  RoutesById,
  RouteById,
  RouteIds,
  RoutesByPath,
  RouteByPath,
  RoutePaths,
  FullSearchSchema,
  AllParams,
  AllLoaderData,
  FullSearchSchemaInput,
  AllContext,
  CommitLocationOptions,
  MatchLocation,
  ResolveFullSearchSchema,
  ResolveFullSearchSchemaInput,
  ResolveAllParamsFromParent,
  RouteContextParameter,
  BeforeLoadContextParameter,
  ResolveAllContext,
  FullSearchSchemaOption,
  MakeRemountDepsOptionsUnion,
  RemountDepsOptions,
  FileRouteTypes,
  FileRoutesByPath,
  UseNavigateResult,
  AnyRedirect,
  Redirect,
  RedirectOptions,
  ResolvedRedirect,
  RouteOptions,
  FileBaseRouteOptions,
  BaseRouteOptions,
  UpdatableRouteOptions,
  RouteLoaderFn,
  LoaderFnContext,
  MakeRouteMatch,
  MakeRouteMatchUnion,
  RouteMatch,
  AnyRouteMatch,
  RouteContextFn,
  RouteContextOptions,
  BeforeLoadContextOptions,
  ContextOptions,
  RootRouteOptions,
  AnyRouteWithContext,
  LazyRouteOptions,
  AnyRoute,
  ResolveFullPath,
  RouteConstraints,
  RouterState,
  ListenerFn,
  BuildNextOptions,
  AnyRouter,
  RegisteredRouter,
  RouterEvents,
  RouterEvent,
  RouterListener,
  MatchRouteOptions,
  RouteMask,
  RouterContextOptions,
  RouterOptions,
  RouterConstructorOptions,
  ControllablePromise,
  CreateFileRoute,
  CreateLazyFileRoute,
  AnySerializationAdapter,
  SerializationAdapter,
  SerializableExtensions,
} from '@tanstack/router-core'

export {
  createHistory,
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
} from '@tanstack/history'

export type {
  BlockerFn,
  HistoryLocation,
  RouterHistory,
  ParsedPath,
  HistoryState,
} from '@tanstack/history'

export {
  redirect,
  isRedirect,
  DEFAULT_PROTOCOL_ALLOWLIST,
} from '@tanstack/router-core'

export { lazyFn, SearchParamError } from '@tanstack/router-core'
export { lazyRouteComponent } from './lazyRouteComponent.svelte.js'

export { notFound, isNotFound } from '@tanstack/router-core'
export type { NotFoundError } from '@tanstack/router-core'

export type {
  ValidateFromPath,
  ValidateToPath,
  ValidateSearch,
  ValidateParams,
  InferFrom,
  InferTo,
  InferMaskTo,
  InferMaskFrom,
  ValidateNavigateOptions,
  ValidateNavigateOptionsArray,
  ValidateRedirectOptions,
  ValidateRedirectOptionsArray,
  ValidateId,
  InferStrict,
  InferShouldThrow,
  InferSelected,
  ValidateUseSearchResult,
  ValidateUseParamsResult,
} from '@tanstack/router-core'

export { composeRewrites } from '@tanstack/router-core'
export type {
  LocationRewrite,
  LocationRewriteFunction,
} from '@tanstack/router-core'

// Svelte-specific exports
export { createRouter, Router } from './router.js'
export {
  createRoute,
  createRootRoute,
  createRootRouteWithContext,
  rootRouteWithContext,
  createRouteMask,
  Route,
  RootRoute,
  NotFoundRoute,
  RouteApi,
  getRouteApi,
} from './route.js'
export type {
  AnyRootRoute,
  SvelteNode,
  RouteComponent,
  ErrorRouteComponent,
  NotFoundRouteComponent,
  AsyncRouteComponent,
} from './route.js'

export {
  createFileRoute,
  FileRoute,
  FileRouteLoader,
  LazyRoute,
  createLazyRoute,
  createLazyFileRoute,
} from './fileRoute.js'

export { useRouter } from './useRouter.js'
export { useRouterState } from './useRouterState.svelte.js'
export { useMatch } from './useMatch.svelte.js'
export { useLocation } from './useLocation.js'
export { useParams } from './useParams.js'
export { useSearch } from './useSearch.js'
export { useNavigate } from './useNavigate.js'
export { default as Navigate } from './Navigate.svelte'
export { useLoaderData } from './useLoaderData.js'
export { useLoaderDeps } from './useLoaderDeps.js'
export { useRouteContext } from './useRouteContext.js'
export { useCanGoBack } from './useCanGoBack.js'
export { useBlocker } from './useBlocker.svelte.js'
export type { ShouldBlockFn, UseBlockerOpts } from './useBlocker.svelte.js'
export { default as Block } from './Block.svelte'
export {
  useMatches,
  useMatchRoute,
  useParentMatches,
  useChildMatches,
} from './useMatches.svelte.js'
export type {
  UseMatchRouteOptions,
  MakeMatchRouteOptions,
} from './useMatches.svelte.js'
export { default as MatchRoute } from './MatchRoute.svelte'

export { default as ClientOnly } from './ClientOnly.svelte'
export { useHydrated } from './useHydrated.svelte.js'
export { default as CatchBoundary } from './CatchBoundary.svelte'
export { default as ErrorComponent } from './ErrorComponent.svelte'
export { default as CatchNotFound } from './CatchNotFound.svelte'
export { default as DefaultGlobalNotFound } from './DefaultGlobalNotFound.svelte'
export * from './history.js'
export type {
  ValidateUseSearchOptions,
  ValidateUseParamsOptions,
} from './typePrimitives.js'

export { default as RouterProvider } from './RouterProvider.svelte'
export type { RouterProps } from './router.js'
export { default as RouterContextProvider } from './RouterContextProvider.svelte'
export { default as Matches } from './Matches.svelte'
export { default as Match } from './Match.svelte'
export { default as Outlet } from './Outlet.svelte'
export { default as Link } from './Link.svelte'
export { createLink, linkOptions } from './createLink.js'
export { useLinkProps } from './useLinkProps.svelte.js'
export type { UseLinkPropsOptions } from './useLinkProps.svelte.js'
export type {
  ActiveLinkOptions,
  CreateLinkProps,
  LinkComponent,
  LinkComponentProps,
  LinkProps,
} from './link.js'
export type {
  ValidateLinkOptions,
  ValidateLinkOptionsArray,
} from './typePrimitives.js'
export { default as Scripts } from './Scripts.svelte'
export { default as HeadContent } from './HeadContent.svelte'
export { default as ScriptOnce } from './ScriptOnce.svelte'
export { default as Asset } from './Asset.svelte'
export { default as Await } from './Await.svelte'
export { useAwaited } from './awaited.svelte.js'
export type { AwaitOptions } from './awaited.svelte.js'
export { default as ScrollRestoration } from './ScrollRestoration.svelte'
export { useElementScrollRestoration } from './scroll-restoration.js'
export { useTags } from './headContentUtils.js'
