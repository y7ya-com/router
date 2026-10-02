<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import {
    getServerFnCallingPost,
    postServerFnCallingGet,
  } from './-functions/serverFnCallingServerFn'
  import type { TestCase } from './-components/Test.svelte'

  const functions = {
    getServerFnCallingPost: {
      fn: getServerFnCallingPost,
      expected: {
        name: 'getServerFnCallingPost',
        method: 'GET',
        innerFnResult: {
          method: 'POST',
        },
      },
    },
    postServerFnCallingGet: {
      fn: postServerFnCallingGet,
      expected: {
        name: 'postServerFnCallingGet',
        method: 'POST',
        innerFnResult: {
          method: 'GET',
        },
      },
    },
  } satisfies Record<string, TestCase>

  export const Route = createFileRoute('/function-method/')()
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
  import Test from './-components/Test.svelte'
</script>

<div class="p-2 m-2 grid gap-2" data-testid="method-route-component">
  <h1 class="font-bold text-lg">Server functions methods E2E tests</h1>
  <div>
    <Link class="inline" to="/factory">
      <h2>Go to Factory Functions and request method E2E test</h2>
    </Link>
  </div>
  {#each Object.entries(functions) as [name, testCase] (name)}
    <Test {...testCase} />
  {/each}
</div>
