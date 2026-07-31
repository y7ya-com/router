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
  isPlainObject,
  isPlainArray,
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
  InjectedHtmlEntry,
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
export { lazyRouteComponent } from './lazyRouteComponent.svelte'

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
export { createRouter, Router } from './router'
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
} from './route'
export type {
  AnyRootRoute,
  SvelteNode,
  RouteComponent,
  ErrorRouteComponent,
  NotFoundRouteComponent,
  AsyncRouteComponent,
} from './route'

export {
  createFileRoute,
  FileRoute,
  FileRouteLoader,
  LazyRoute,
  createLazyRoute,
  createLazyFileRoute,
} from './fileRoute'

export { useRouter } from './useRouter'
export { useRouterState } from './useRouterState.svelte'
export { useMatch } from './useMatch.svelte'
export { useLocation } from './useLocation'
export { useParams } from './useParams'
export { useSearch } from './useSearch'
export { useNavigate } from './useNavigate'
export { default as Navigate } from './Navigate.svelte'
export { useLoaderData } from './useLoaderData'
export { useLoaderDeps } from './useLoaderDeps'
export { useRouteContext } from './useRouteContext'
export { useCanGoBack } from './useCanGoBack'
export { useBlocker } from './useBlocker.svelte'
export type {
  BlockerResolver,
  ShouldBlockFn,
  UseBlockerOpts,
} from './useBlocker.svelte'
export { default as Block } from './Block.svelte'
export {
  useMatches,
  useMatchRoute,
  useParentMatches,
  useChildMatches,
} from './useMatches.svelte'
export type {
  UseMatchRouteOptions,
  MakeMatchRouteOptions,
} from './useMatches.svelte'
export { default as MatchRoute } from './MatchRoute.svelte'

export { default as ClientOnly } from './ClientOnly.svelte'
export { useHydrated } from './useHydrated.svelte'
export { default as CatchBoundary } from './CatchBoundary.svelte'
export { default as ErrorComponent } from './ErrorComponent.svelte'
export { default as CatchNotFound } from './CatchNotFound.svelte'
export { default as DefaultGlobalNotFound } from './DefaultGlobalNotFound.svelte'
export { getNotFound } from './not-found'
export * from './history'
export type {
  ValidateUseSearchOptions,
  ValidateUseParamsOptions,
} from './typePrimitives'

export { default as RouterProvider } from './RouterProvider.svelte'
export { default as RouterContextProvider } from './RouterContextProvider.svelte'
export { default as Matches } from './Matches.svelte'
export { default as Match } from './Match.svelte'
export { default as Outlet } from './Outlet.svelte'
export { default as Link } from './Link.svelte'
export { createLink, linkOptions } from './createLink'
export { useLinkProps } from './useLinkProps.svelte'
export type { UseLinkPropsOptions, LinkStateProps } from './useLinkProps.svelte'
export type { LinkOptionsFn, LinkOptionsFnOptions } from './createLink'
export type {
  ValidateLinkOptions,
  ValidateLinkOptionsArray,
} from './typePrimitives'
export { default as Scripts } from './Scripts.svelte'
export { default as HeadContent } from './HeadContent.svelte'
export { default as ScriptOnce } from './ScriptOnce.svelte'
export { default as Asset } from './Asset.svelte'
export { default as Await } from './Await.svelte'
export { useAwaited } from './awaited.svelte'
export { default as ScrollRestoration } from './ScrollRestoration.svelte'
export { useElementScrollRestoration } from './scroll-restoration'
export { useTags } from './headContentUtils'

export { isSnippet, isComponent } from './utils'
