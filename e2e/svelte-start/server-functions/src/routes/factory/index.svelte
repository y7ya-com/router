<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/factory/')({
    ssr: false,
  })
</script>

<script lang="ts">
  import { fnInsideRoute } from './-functions/fnInsideRoute'
  import { fooFnInsideFactoryFile } from './-functions/createFooServerFn'
  import {
    barFn,
    barFnPOST,
    composedFn,
    fakeFn,
    fooFn,
    fooFnPOST,
    localFn,
    localFnPOST,
  } from './-functions/functions'
  import Test from './-components/Test.svelte'
  import type { TestCase } from './-components/Test.svelte'

  const functions = {
    fnInsideRoute: {
      fn: fnInsideRoute,
      type: 'serverFn',
      expected: {
        name: 'fnInsideRoute',
        method: 'GET',
      },
    },
    fooFnInsideFactoryFile: {
      fn: fooFnInsideFactoryFile,
      type: 'serverFn',

      expected: {
        name: 'fooFnInsideFactoryFile',
        context: { foo: 'foo', method: 'GET' },
        method: 'GET',
      },
    },
    fooFn: {
      fn: fooFn,
      type: 'serverFn',

      expected: {
        name: 'fooFn',
        context: { foo: 'foo', method: 'GET' },
        method: 'GET',
      },
    },
    fooFnPOST: {
      fn: fooFnPOST,
      type: 'serverFn',

      expected: {
        name: 'fooFnPOST',
        context: { foo: 'foo', method: 'POST' },
        method: 'POST',
      },
    },
    barFn: {
      fn: barFn,
      type: 'serverFn',

      expected: {
        name: 'barFn',
        context: { foo: 'foo', method: 'GET', bar: 'bar' },
        method: 'GET',
      },
    },
    barFnPOST: {
      fn: barFnPOST,
      type: 'serverFn',

      expected: {
        name: 'barFnPOST',
        context: { foo: 'foo', method: 'POST', bar: 'bar' },
        method: 'POST',
      },
    },
    localFn: {
      fn: localFn,
      type: 'serverFn',

      expected: {
        name: 'localFn',
        context: {
          foo: 'foo',
          method: 'GET',
          bar: 'bar',
          local: 'local',
          another: 'another',
        },
        method: 'GET',
      },
    },
    localFnPOST: {
      fn: localFnPOST,
      type: 'serverFn',

      expected: {
        name: 'localFnPOST',
        context: {
          foo: 'foo',
          method: 'POST',
          bar: 'bar',
          local: 'local',
          another: 'another',
        },
        method: 'POST',
      },
    },
    composedFn: {
      fn: composedFn,
      type: 'serverFn',
      expected: {
        name: 'composedFn',
        context: {
          foo: 'foo',
          method: 'GET',
          bar: 'bar',
          another: 'another',
          local: 'local',
        },
        method: 'GET',
      },
    },
    fakeFn: {
      fn: fakeFn,
      type: 'localFn',
      expected: {
        name: 'fakeFn',
        window,
      },
    },
  } satisfies Record<string, TestCase>
</script>

<div class="p-2 m-2 grid gap-2" data-testid="factory-route-component">
  <h1 class="font-bold text-lg">Server functions middleware E2E tests</h1>
  {#each Object.entries(functions) as [name, testCase] (name)}
    <Test {...testCase} />
  {/each}
</div>
