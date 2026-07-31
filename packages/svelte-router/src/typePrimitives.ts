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
 * Constrains a link options object against the route tree. The constraint is
 * router-core's LinkOptions (there is no component-level LinkComponentProps
 * here); `TComp` is unused but kept so the signature stays stable.
 */
export type ValidateLinkOptions<
  TRouter extends AnyRouter = RegisteredRouter,
  TOptions = unknown,
  TDefaultFrom extends string = string,
  // eslint-disable-next-line unused-imports/no-unused-vars -- signature parity with ValidateLinkOptionsArray's forwarding
  TComp = 'a',
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
