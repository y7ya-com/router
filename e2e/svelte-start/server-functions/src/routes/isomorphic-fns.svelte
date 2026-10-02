<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import {
    getEcho,
    getEnv,
    getServerEcho,
    getServerEnv,
  } from './-functions/isomorphic-fns'

  export const Route = createFileRoute('/isomorphic-fns')({
    loader() {
      return {
        envOnLoad: getEnv(),
      }
    },
  })
</script>

<script lang="ts">
  const loaderData = Route.useLoaderData()
  let results = $state<Partial<Record<string, string>> | undefined>()

  async function handleClick() {
    const envOnClick = getEnv()
    const echo = getEcho('hello')
    const [serverEnv, serverEcho] = await Promise.all([
      getServerEnv(),
      getServerEcho({ data: 'hello' }),
    ])
    results = { envOnClick, echo, serverEnv, serverEcho }
  }
</script>

<div>
  <button onclick={handleClick} data-testid="test-isomorphic-results-btn">
    Run
  </button>
  {#if !!results}
    <div>
      <h1>
        <code>getEnv</code>
      </h1>
      When we called the function on the server it returned:
      <pre data-testid="server-result">{JSON.stringify(results.serverEnv)}</pre>
      When we called the function on the client it returned:
      <pre data-testid="client-result">{JSON.stringify(
          results.envOnClick,
        )}</pre>
      When we called the function during SSR it returned:
      <pre data-testid="ssr-result">{JSON.stringify(
          loaderData.current.envOnLoad,
        )}</pre>
      <br />
      <h1>
        <code>echo</code>
      </h1>
      When we called the function on the server it returned:
      <pre data-testid="server-echo-result">{JSON.stringify(
          results.serverEcho,
        )}</pre>
      When we called the function on the client it returned:
      <pre data-testid="client-echo-result">{JSON.stringify(results.echo)}</pre>
    </div>
  {/if}
</div>
