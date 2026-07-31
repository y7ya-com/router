import type { UseParamsOptions } from './useParams'
import type { UseSearchOptions } from './useSearch'
import type {
  AnyRouter,
  Constrain,
  InferFrom,
  InferMaskFrom,
  InferMaskTo,
  InferSelected,
  InferShouldThrow,
  InferStrict,
  InferTo,
  LinkOptions,
  RegisteredRouter,
} from '@tanstack/router-core'

/**
 * Mirrors solid-router's ValidateLinkOptions. Solid constrains against its
 * component-level LinkComponentProps; the Svelte adapter constrains against
 * router-core's LinkOptions, which carries the same from/to/mask inference.
 * `TComp` is kept for signature parity with the other adapters.
 */
export type ValidateLinkOptions<
  TRouter extends AnyRouter = RegisteredRouter,
  TOptions = unknown,
  TDefaultFrom extends string = string,
  _TComp = 'a',
> = Constrain<
  TOptions,
  LinkOptions<
    TRouter,
    InferFrom<TOptions, TDefaultFrom>,
    InferTo<TOptions>,
    InferMaskFrom<TOptions>,
    InferMaskTo<TOptions>
  >
>

export type ValidateLinkOptionsArray<
  TRouter extends AnyRouter = RegisteredRouter,
  TOptions extends ReadonlyArray<any> = ReadonlyArray<unknown>,
  TDefaultFrom extends string = string,
  TComp = 'a',
> = {
  [K in keyof TOptions]: ValidateLinkOptions<
    TRouter,
    TOptions[K],
    TDefaultFrom,
    TComp
  >
}

export type ValidateUseSearchOptions<
  TOptions,
  TRouter extends AnyRouter = RegisteredRouter,
> = Constrain<
  TOptions,
  UseSearchOptions<
    TRouter,
    InferFrom<TOptions>,
    InferStrict<TOptions>,
    InferShouldThrow<TOptions>,
    InferSelected<TOptions>
  >
>

export type ValidateUseParamsOptions<
  TOptions,
  TRouter extends AnyRouter = RegisteredRouter,
> = Constrain<
  TOptions,
  UseParamsOptions<
    TRouter,
    InferFrom<TOptions>,
    InferStrict<TOptions>,
    InferShouldThrow<TOptions>,
    InferSelected<TOptions>
  >
>
