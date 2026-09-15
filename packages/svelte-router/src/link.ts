import type { Component, Snippet } from 'svelte'
import type { SvelteHTMLElements } from 'svelte/elements'
import type {
  AnyRouter,
  LinkOptions,
  RegisteredRouter,
} from '@tanstack/router-core'

/** The `internals` argument every Svelte 5 component function receives. */
type ComponentInternals = Parameters<Component<any>>[0]

/**
 * The element-level props of the thing a link renders: the attributes of an
 * HTML/SVG element for a tag name, or the props of a Svelte component.
 */
type LinkComponentSvelteProps<TComp> = TComp extends keyof SvelteHTMLElements
  ? Omit<
      SvelteHTMLElements[TComp],
      keyof CreateLinkProps | 'children' | 'style'
    > & { style?: string }
  : TComp extends Component<infer TProps>
    ? Omit<TProps, keyof CreateLinkProps>
    : never

type ActiveLinkProps<TComp> = Partial<
  LinkComponentSvelteProps<TComp> & {
    [key: `data-${string}`]: unknown
  }
>

export interface ActiveLinkOptionProps<TComp = 'a'> {
  /**
   * Additional props for the `active` state of this link. They override the
   * other props passed to the link (`style`s are merged, `class`es are
   * concatenated).
   */
  activeProps?: ActiveLinkProps<TComp> | (() => ActiveLinkProps<TComp>)
  /**
   * Additional props for the `inactive` state of this link. They override the
   * other props passed to the link (`style`s are merged, `class`es are
   * concatenated).
   */
  inactiveProps?: ActiveLinkProps<TComp> | (() => ActiveLinkProps<TComp>)
}

export type ActiveLinkOptions<
  TComp = 'a',
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends string = string,
  TTo extends string | undefined = '.',
  TMaskFrom extends string = TFrom,
  TMaskTo extends string = '.',
> = LinkOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo> &
  ActiveLinkOptionProps<TComp>

export interface LinkPropsChildren {
  /** Children receive `{ isActive }` so the element can style itself by state. */
  children?: Snippet<[{ isActive: boolean }]> | Snippet<[]>
}

export type LinkProps<
  TComp = 'a',
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends string = string,
  TTo extends string | undefined = '.',
  TMaskFrom extends string = TFrom,
  TMaskTo extends string = '.',
> = ActiveLinkOptions<TComp, TRouter, TFrom, TTo, TMaskFrom, TMaskTo> &
  LinkPropsChildren

/** The full prop bag of a link: route-aware options plus element props. */
export type LinkComponentProps<
  TComp = 'a',
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends string = string,
  TTo extends string | undefined = '.',
  TMaskFrom extends string = TFrom,
  TMaskTo extends string = '.',
> = LinkComponentSvelteProps<TComp> &
  LinkProps<TComp, TRouter, TFrom, TTo, TMaskFrom, TMaskTo>

export type CreateLinkProps = LinkProps<
  any,
  any,
  string,
  string,
  string,
  string
>

/** A route-aware link component, as returned by `createLink`. */
export type LinkComponent<
  in out TComp,
  in out TDefaultFrom extends string = string,
> = <
  TRouter extends AnyRouter = RegisteredRouter,
  const TFrom extends string = TDefaultFrom,
  const TTo extends string | undefined = undefined,
  const TMaskFrom extends string = TFrom,
  const TMaskTo extends string = '',
>(
  internals: ComponentInternals,
  props: LinkComponentProps<TComp, TRouter, TFrom, TTo, TMaskFrom, TMaskTo>,
) => Record<string, any>

/** `Route.Link`: a link whose `from` is fixed to the route's full path. */
export interface LinkComponentRoute<
  in out TDefaultFrom extends string = string,
> {
  defaultFrom: TDefaultFrom;
  <
    TRouter extends AnyRouter = RegisteredRouter,
    const TTo extends string | undefined = undefined,
    const TMaskTo extends string = '',
  >(
    internals: ComponentInternals,
    props: LinkComponentProps<
      'a',
      TRouter,
      this['defaultFrom'],
      TTo,
      this['defaultFrom'],
      TMaskTo
    >,
  ): Record<string, any>
}

/**
 * `<Link>`'s own prop type: the public props plus the element `createLink`
 * renders in place of `<a>`.
 */
export type LinkElementProps<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends string = string,
  TTo extends string | undefined = '.',
  TMaskFrom extends string = TFrom,
  TMaskTo extends string = '.',
> = LinkComponentProps<'a', TRouter, TFrom, TTo, TMaskFrom, TMaskTo> & {
  /** @internal set by `createLink` */
  _asChild?: unknown
}
