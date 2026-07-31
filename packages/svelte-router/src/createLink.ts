import Link from './Link.svelte'
import type { Component } from 'svelte'
import type { AnyRouter, RegisteredRouter } from '@tanstack/router-core'
import type {
  ValidateLinkOptions,
  ValidateLinkOptionsArray,
} from './typePrimitives'

/**
 * Creates a custom Link variant that renders the given element/component
 * instead of `<a>`. Mirrors solid-router's `createLink`.
 *
 * `target` can be:
 *  - a string HTML element name (e.g. `'button'`) — rendered via `<svelte:element>`
 *  - a Svelte 5 component — rendered as `<Comp ... />` with link props spread
 */
export function createLink<TComp extends string | Component<any>>(
  target: TComp,
): Component<any> {
  // Svelte 5 components are functions with a specific call shape. We wrap
  // `Link` to pre-bind `_asChild`. The returned callable matches Svelte's
  // `Component` signature.
  const wrapped: any = (internals: any, props: any) => {
    return (Link as any)(internals, { ...props, _asChild: target })
  }
  return wrapped as Component<any>
}

export type LinkOptionsFnOptions<
  TOptions,
  TComp,
  TRouter extends AnyRouter = RegisteredRouter,
> =
  TOptions extends ReadonlyArray<any>
    ? ValidateLinkOptionsArray<TRouter, TOptions, string, TComp>
    : ValidateLinkOptions<TRouter, TOptions, string, TComp>

export type LinkOptionsFn<TComp> = <
  const TOptions,
  TRouter extends AnyRouter = RegisteredRouter,
>(
  options: LinkOptionsFnOptions<TOptions, TComp, TRouter>,
) => TOptions

/**
 * Type-checks a link options object against the route tree without rendering
 * anything — an identity function at runtime. Mirrors solid-router.
 */
export const linkOptions: LinkOptionsFn<'a'> = (options) => {
  return options as any
}
