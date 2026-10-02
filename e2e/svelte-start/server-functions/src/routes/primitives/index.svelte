<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import {
    $nullGet as nullGet,
    $nullPost as nullPost,
    $stringGet as stringGet,
    $stringPost as stringPost,
    $undefinedGet as undefinedGet,
    $undefinedPost as undefinedPost,
  } from './-functions/index'

  export const Route = createFileRoute('/primitives/')({
    ssr: true,
  })

  function stringify(data: any) {
    return JSON.stringify(data === undefined ? '$undefined' : data)
  }

  interface PrimitiveComponentProps<T> {
    serverFn: {
      get: (opts: { data: T }) => Promise<T>
      post: (opts: { data: T }) => Promise<T>
    }
    data: {
      value: T
      type: string
    }
  }

  function makeTestCase<T>(props: PrimitiveComponentProps<T>) {
    return props
  }
  const testCases = [
    makeTestCase({
      data: {
        value: null,
        type: 'null',
      },
      serverFn: {
        get: nullGet,
        post: nullPost,
      },
    }),
    makeTestCase({
      data: {
        value: undefined,
        type: 'undefined',
      },
      serverFn: {
        get: undefinedGet,
        post: undefinedPost,
      },
    }),
    makeTestCase({
      data: {
        value: 'foo-bar',
        type: 'string',
      },
      serverFn: {
        get: stringGet,
        post: stringPost,
      },
    }),
  ] as Array<PrimitiveComponentProps<any>>

  type Method = 'get' | 'post'
</script>

<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  const testQueries = testCases.map((testCase) => {
    const makeQuery = (method: Method) =>
      createQuery(() => ({
        queryKey: [testCase.data.type, method],
        queryFn: async () => {
          const result = await testCase.serverFn[method]({
            data: testCase.data.value,
          })
          if (result === undefined) {
            return '$undefined'
          }
          return result
        },
      }))

    return {
      testCase,
      queries: {
        post: makeQuery('post'),
        get: makeQuery('get'),
      },
    }
  })
</script>

{#each testQueries as { testCase, queries } (testCase.data.type)}
  <div>
    <h2>data type: {testCase.data.type}</h2>

    {#each ['post', 'get'] as const as method (method)}
      {@const testId = `${method}-${testCase.data.type}`}
      {@const query = queries[method]}
      <div>
        <h3>serverFn method={method}</h3>
        <h4>expected</h4>
        <div data-testid={`expected-${testId}`}>
          {stringify(testCase.data.value)}
        </div>
        <h4>result</h4>
        <div data-testid={`result-${testId}`}>
          {query.isSuccess ? stringify(query.data) : ''}
        </div>
        <br />
      </div>
    {/each}
    <br />
    <br />
  </div>
{/each}
