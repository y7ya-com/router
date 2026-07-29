import {
  BaseRootRoute,
  BaseRoute,
  BaseRouteApi,
  notFound,
} from '@tanstack/router-core'
import { useMatch } from './useMatch.svelte'
import { useLoaderData } from './useLoaderData'
import { useLoaderDeps } from './useLoaderDeps'
import { useParams } from './useParams'
import { useSearch } from './useSearch'
import { useNavigate } from './useNavigate'
import { useRouteContext } from './useRouteContext'
import { useRouter } from './useRouter'
import LinkComponent from './Link.svelte'
import type {
  AnyContext,
  AnyRoute,
  AnyRouter,
  ConstrainLiteral,
  ErrorComponentProps,
  NotFoundError,
  NotFoundRouteProps,
  Register,
  RegisteredRouter,
  ResolveFullPath,
  ResolveId,
  ResolveParams,
  RootRouteOptions,
  RouteConstraints,
  RouteIds,
  RouteMask,
  RouteOptions,
  RouteTypesById,
  RouterCore,
  ToMaskOptions,
  UseNavigateResult,
} from '@tanstack/router-core'
import type { Component, Snippet } from 'svelte'
import type { UseLoaderDataRoute } from './useLoaderData'
import type { UseLoaderDepsRoute } from './useLoaderDeps'
import type { UseMatchRoute } from './useMatch.svelte'
import type { UseParamsRoute } from './useParams'
import type { UseRouteContextRoute } from './useRouteContext'
import type { UseSearchRoute } from './useSearch'

declare module '@tanstack/router-core' {
  export interface UpdatableRouteOptionsExtensions {
    component?: RouteComponent
    errorComponent?: false | null | undefined | ErrorRouteComponent
    notFoundComponent?: NotFoundRouteComponent
    pendingComponent?: RouteComponent
  }

  export interface RootRouteOptionsExtensions {
    shellComponent?: Component<{ children: Snippet }> | Snippet<[]>
  }

  export interface RouteExtensions<
    in out TId extends string,
    in out TFullPath extends string,
  > {
    useMatch: UseMatchRoute<TId>
    useRouteContext: UseRouteContextRoute<TId>
    useSearch: UseSearchRoute<TId>
    useParams: UseParamsRoute<TId>
    useLoaderDeps: UseLoaderDepsRoute<TId>
    useLoaderData: UseLoaderDataRoute<TId>
    useNavigate: () => UseNavigateResult<TFullPath>
  }
}

export type SvelteNode = Snippet | Component<any>

export type RouteComponent = Component<any> | Snippet<[]>

export type ErrorRouteComponent =
  | Component<ErrorComponentProps>
  | Snippet<[ErrorComponentProps]>

export type NotFoundRouteComponent =
  | Component<NotFoundRouteProps>
  | Snippet<[NotFoundRouteProps]>

export type AsyncRouteComponent<TProps extends Record<string, any>> =
  | Component<TProps>
  | Snippet<[TProps]>

export interface DefaultRouteTypes<TProps extends Record<string, any>> {
  component: Component<TProps> | Snippet<[TProps]>
}
export interface RouteTypes<TProps extends Record<string, any>>
  extends DefaultRouteTypes<TProps> {}

export class Route<
  in out TRegister = unknown,
  in out TParentRoute extends RouteConstraints['TParentRoute'] = AnyRoute,
  in out TPath extends RouteConstraints['TPath'] = '/',
  in out TFullPath extends RouteConstraints['TFullPath'] = ResolveFullPath<
    TParentRoute,
    TPath
  >,
  in out TCustomId extends RouteConstraints['TCustomId'] = string,
  in out TId extends RouteConstraints['TId'] = ResolveId<
    TParentRoute,
    TCustomId,
    TPath
  >,
  in out TSearchValidator = undefined,
  in out TParams = ResolveParams<TPath>,
  in out TRouterContext = AnyContext,
  in out TRouteContextFn = AnyContext,
  in out TBeforeLoadFn = AnyContext,
  in out TLoaderDeps extends Record<string, any> = {},
  in out TLoaderFn = undefined,
  in out TChildren = unknown,
  in out TFileRouteTypes = unknown,
  in out TSSR = unknown,
  in out TMiddlewares = unknown,
  in out THandlers = undefined,
> extends BaseRoute<
  TRegister,
  TParentRoute,
  TPath,
  TFullPath,
  TCustomId,
  TId,
  TSearchValidator,
  TParams,
  TRouterContext,
  TRouteContextFn,
  TBeforeLoadFn,
  TLoaderDeps,
  TLoaderFn,
  TChildren,
  TFileRouteTypes,
  TSSR,
  TMiddlewares,
  THandlers
> {
  useMatch: UseMatchRoute<TId> = (opts) =>
    useMatch({ select: opts?.select, from: this.id } as any) as any

  useRouteContext: UseRouteContextRoute<TId> = (opts?) =>
    useRouteContext({ ...(opts as any), from: this.id }) as any

  useSearch: UseSearchRoute<TId> = (opts) =>
    useSearch({ select: opts?.select, from: this.id } as any) as any

  useParams: UseParamsRoute<TId> = (opts) =>
    useParams({ select: opts?.select, from: this.id } as any) as any

  useLoaderDeps: UseLoaderDepsRoute<TId> = (opts) =>
    useLoaderDeps({ ...opts, from: this.id } as any)

  useLoaderData: UseLoaderDataRoute<TId> = (opts) =>
    useLoaderData({ ...opts, from: this.id } as any)

  useNavigate = (): UseNavigateResult<TFullPath> =>
    useNavigate({ from: this.fullPath as any })

  // Route-bound Link — equivalent to `<Link from={route.fullPath} ...>`.
  // Matches the `route.Link` shorthand found in solid-router and react-router.
  Link: any = ((internals: any, props: any) =>
    (LinkComponent as any)(internals, {
      from: this.fullPath,
      ...props,
    })) as any
}

export function createRoute<
  TRegister = unknown,
  TParentRoute extends RouteConstraints['TParentRoute'] = AnyRoute,
  TPath extends RouteConstraints['TPath'] = '/',
  TFullPath extends RouteConstraints['TFullPath'] = ResolveFullPath<
    TParentRoute,
    TPath
  >,
  TCustomId extends RouteConstraints['TCustomId'] = string,
  TId extends RouteConstraints['TId'] = ResolveId<
    TParentRoute,
    TCustomId,
    TPath
  >,
  TSearchValidator = undefined,
  TParams = ResolveParams<TPath>,
  TRouteContextFn = AnyContext,
  TBeforeLoadFn = AnyContext,
  TLoaderDeps extends Record<string, any> = {},
  TLoaderFn = undefined,
  TChildren = unknown,
  TSSR = unknown,
  THandlers = undefined,
>(
  options: RouteOptions<
    TRegister,
    TParentRoute,
    TId,
    TCustomId,
    TFullPath,
    TPath,
    TSearchValidator,
    TParams,
    TLoaderDeps,
    TLoaderFn,
    AnyContext,
    TRouteContextFn,
    TBeforeLoadFn,
    TSSR,
    THandlers
  >,
): Route<
  TRegister,
  TParentRoute,
  TPath,
  TFullPath,
  TCustomId,
  TId,
  TSearchValidator,
  TParams,
  AnyContext,
  TRouteContextFn,
  TBeforeLoadFn,
  TLoaderDeps,
  TLoaderFn,
  TChildren,
  unknown,
  TSSR,
  unknown,
  THandlers
> {
  return new Route(options as any) as any
}

export type AnyRootRoute = RootRoute<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>

type RootRouteId = '__root__'

export class RootRoute<
  in out TRegister = Register,
  in out TSearchValidator = undefined,
  in out TRouterContext = {},
  in out TRouteContextFn = AnyContext,
  in out TBeforeLoadFn = AnyContext,
  in out TLoaderDeps extends Record<string, any> = {},
  in out TLoaderFn = undefined,
  in out TChildren = unknown,
  in out TFileRouteTypes = unknown,
  in out TSSR = unknown,
  in out THandlers = undefined,
> extends BaseRootRoute<
  TRegister,
  TSearchValidator,
  TRouterContext,
  TRouteContextFn,
  TBeforeLoadFn,
  TLoaderDeps,
  TLoaderFn,
  TChildren,
  TFileRouteTypes,
  TSSR,
  THandlers
> {
  useMatch: UseMatchRoute<RootRouteId> = (opts) =>
    useMatch({ select: opts?.select, from: this.id } as any) as any

  useRouteContext: UseRouteContextRoute<RootRouteId> = (opts) =>
    useRouteContext({ ...(opts as any), from: this.id }) as any

  useSearch: UseSearchRoute<RootRouteId> = (opts) =>
    useSearch({ select: opts?.select, from: this.id } as any) as any

  useParams: UseParamsRoute<RootRouteId> = (opts) =>
    useParams({ select: opts?.select, from: this.id } as any) as any

  useLoaderDeps: UseLoaderDepsRoute<RootRouteId> = (opts) =>
    useLoaderDeps({ ...opts, from: this.id } as any)

  useLoaderData: UseLoaderDataRoute<RootRouteId> = (opts) =>
    useLoaderData({ ...opts, from: this.id } as any)

  useNavigate = (): UseNavigateResult<'/'> =>
    useNavigate({ from: this.fullPath as any })

  // Root-route-bound Link (rarely useful but matches solid/react parity).
  Link: any = ((internals: any, props: any) =>
    (LinkComponent as any)(internals, {
      from: this.fullPath,
      ...props,
    })) as any
}

export function getRouteApi<
  const TId,
  TRouter extends AnyRouter = RegisteredRouter,
>(id: ConstrainLiteral<TId, RouteIds<TRouter['routeTree']>>) {
  return new RouteApi<TId, TRouter>({ id })
}

export class RouteApi<
  TId,
  TRouter extends AnyRouter = RegisteredRouter,
> extends BaseRouteApi<TId, TRouter> {
  /** @deprecated Use the `getRouteApi` function instead. */
  constructor({ id }: { id: TId }) {
    super({ id })
  }

  useMatch: UseMatchRoute<TId> = (opts) =>
    useMatch({ select: opts?.select, from: this.id } as any) as any

  useRouteContext: UseRouteContextRoute<TId> = (opts) =>
    useRouteContext({ ...(opts as any), from: this.id as any }) as any

  useSearch: UseSearchRoute<TId> = (opts) =>
    useSearch({ select: opts?.select, from: this.id } as any) as any

  useParams: UseParamsRoute<TId> = (opts) =>
    useParams({ select: opts?.select, from: this.id } as any) as any

  useLoaderDeps: UseLoaderDepsRoute<TId> = (opts) =>
    useLoaderDeps({ ...opts, from: this.id, strict: false } as any)

  useLoaderData: UseLoaderDataRoute<TId> = (opts) =>
    useLoaderData({ ...opts, from: this.id, strict: false } as any)

  useNavigate = (): UseNavigateResult<
    RouteTypesById<TRouter, TId>['fullPath']
  > => {
    const router = useRouter()
    return useNavigate({
      from: (router.routesById[this.id as string]?.fullPath ?? '/'),
    })
  }

  // Link bound to this route — equivalent to `<Link from={fullPath} ...>`.
  Link: any = ((internals: any, props: any) => {
    const router = useRouter()
    const fullPath =
      (router.routesById[this.id as string])?.fullPath ?? '/'
    return (LinkComponent as any)(internals, { from: fullPath, ...props })
  }) as any

  notFound = (opts?: NotFoundError) => {
    return notFound({ routeId: this.id as string, ...opts })
  }
}

export function createRootRouteWithContext<TRouterContext extends {}>() {
  return <
    TRegister = Register,
    TRouteContextFn = AnyContext,
    TBeforeLoadFn = AnyContext,
    TSearchValidator = undefined,
    TLoaderDeps extends Record<string, any> = {},
    TLoaderFn = undefined,
    TSSR = unknown,
    THandlers = undefined,
  >(
    options?: RootRouteOptions<
      TRegister,
      TSearchValidator,
      TRouterContext,
      TRouteContextFn,
      TBeforeLoadFn,
      TLoaderDeps,
      TLoaderFn,
      TSSR,
      THandlers
    >,
  ) =>
    createRootRoute<
      TRegister,
      TSearchValidator,
      TRouterContext,
      TRouteContextFn,
      TBeforeLoadFn,
      TLoaderDeps,
      TLoaderFn,
      TSSR,
      THandlers
    >(options)
}

export const rootRouteWithContext = createRootRouteWithContext

export function createRootRoute<
  TRegister = Register,
  TSearchValidator = undefined,
  TRouterContext = {},
  TRouteContextFn = AnyContext,
  TBeforeLoadFn = AnyContext,
  TLoaderDeps extends Record<string, any> = {},
  TLoaderFn = undefined,
  TSSR = unknown,
  THandlers = undefined,
>(
  options?: RootRouteOptions<
    TRegister,
    TSearchValidator,
    TRouterContext,
    TRouteContextFn,
    TBeforeLoadFn,
    TLoaderDeps,
    TLoaderFn,
    TSSR,
    THandlers
  >,
): RootRoute<
  TRegister,
  TSearchValidator,
  TRouterContext,
  TRouteContextFn,
  TBeforeLoadFn,
  TLoaderDeps,
  TLoaderFn,
  unknown,
  unknown,
  TSSR,
  THandlers
> {
  return new RootRoute(options as any) as any
}

export function createRouteMask<
  TRouteTree extends AnyRoute,
  TFrom extends string,
  TTo extends string,
>(
  opts: {
    routeTree: TRouteTree
  } & ToMaskOptions<RouterCore<TRouteTree, 'never', false>, TFrom, TTo>,
): RouteMask<TRouteTree> {
  return opts as any
}
