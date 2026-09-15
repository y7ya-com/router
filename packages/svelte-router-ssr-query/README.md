<div align="center">
  <picture>
    <source
      media="(prefers-color-scheme: dark)"
      srcset="https://tanstack.com/api/readme/router.png?title=TanStack%20Svelte%20Router&theme=dark"
    />
    <source
      media="(prefers-color-scheme: light)"
      srcset="https://tanstack.com/api/readme/router.png?title=TanStack%20Svelte%20Router"
    />
    <img
      src="https://tanstack.com/api/readme/router.png?title=TanStack%20Svelte%20Router"
      alt="TanStack Svelte Router"
      width="900"
    />
  </picture>
</div>

# @tanstack/svelte-router-ssr-query

SSR Query integration for TanStack Svelte Router.

## Installation

```bash
npm install @tanstack/svelte-router-ssr-query
```

## Usage

```ts
import { setupRouterSsrQueryIntegration } from '@tanstack/svelte-router-ssr-query'
import { QueryClient } from '@tanstack/svelte-query'

const queryClient = new QueryClient()

setupRouterSsrQueryIntegration({
  router,
  queryClient,
})
```

The integration also provides the `QueryClient` to the route tree, so
`createQuery` works in route components without a `QueryClientProvider`. Pass
`wrapQueryClient: false` to provide it yourself.
