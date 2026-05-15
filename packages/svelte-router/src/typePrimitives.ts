import type { UseParamsOptions } from './useParams'
import type { UseSearchOptions } from './useSearch'
import type {
  AnyRouter,
  Constrain,
  InferFrom,
  InferSelected,
  InferShouldThrow,
  InferStrict,
  RegisteredRouter,
} from '@tanstack/router-core'

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
