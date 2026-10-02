<script module lang="ts">
  export const HttpMethods = [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'OPTIONS',
    'HEAD',
  ] as const
  export type HttpMethods = (typeof HttpMethods)[number]

  type OnlyAnyApiResponse = {
    method: HttpMethods
    handler: 'ANY'
  }
</script>

<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  let { method }: { method: string } = $props()

  const query = createQuery(() => ({
    queryKey: ['only-any', method],
    queryFn: async () => {
      const requestMethod = method as HttpMethods
      const response = await fetch(`/api/only-any`, { method: requestMethod })

      try {
        return (await response.json()) as OnlyAnyApiResponse
      } catch {
        // handle HEAD and OPTIONS that have no body
        return {
          handler: (response.headers.get('x-handler') ??
            'ANY') as OnlyAnyApiResponse['handler'],
          method: (response.headers.get('x-method') ??
            requestMethod) as OnlyAnyApiResponse['method'],
        }
      }
    },
  }))
</script>

<div>
  <h3>method={method}</h3>
  <h4>expected</h4>
  <div data-testid={`expected-${method}`}>{method}</div>
  <h4>result</h4>
  {#if query.data}
    <div data-testid={`result-${method}`}>
      {query.data.method}
    </div>
  {/if}
</div>
