import { useRouter } from './useRouter.js'
import type {
  AnyRouter,
  FromPathOption,
  NavigateOptions,
  RegisteredRouter,
  UseNavigateResult,
} from '@tanstack/router-core'

export function useNavigate<
  TRouter extends AnyRouter = RegisteredRouter,
  TDefaultFrom extends string = string,
>(_defaultOpts?: {
  from?: FromPathOption<TRouter, TDefaultFrom>
}): UseNavigateResult<TDefaultFrom> {
  const router = useRouter<AnyRouter>()

  return ((options: NavigateOptions<AnyRouter>) => {
    return router.navigate({
      ...options,
      from: options.from ?? _defaultOpts?.from,
    })
  }) as UseNavigateResult<TDefaultFrom>
}
