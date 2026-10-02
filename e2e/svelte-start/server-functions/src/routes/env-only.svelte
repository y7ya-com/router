<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/env-only')()
</script>

<script lang="ts">
  import { clientEcho, serverEcho, testOnServer } from './-functions/env-only'

  let results = $state<Partial<Record<string, string>> | undefined>()

  async function handleClick() {
    const { serverOnServer, clientOnServer } = await testOnServer()
    const clientOnClient = clientEcho('hello')
    let serverOnClient: string
    try {
      serverOnClient = serverEcho('hello')
    } catch (e) {
      serverOnClient =
        'serverEcho threw an error: ' +
        (e instanceof Error ? e.message : String(e))
    }
    results = {
      serverOnServer,
      clientOnServer,
      clientOnClient,
      serverOnClient,
    }
  }
</script>

<div>
  <button onclick={handleClick} data-testid="test-env-only-results-btn">
    Run
  </button>
  {#if !!results}
    <div>
      <h1>
        <code>serverEcho</code>
      </h1>
      When we called the function on the server:
      <pre data-testid="server-on-server">{results.serverOnServer}</pre>
      When we called the function on the client:
      <pre data-testid="server-on-client">{results.serverOnClient}</pre>
      <br />
      <h1>
        <code>clientEcho</code>
      </h1>
      When we called the function on the server:
      <pre data-testid="client-on-server">{results.clientOnServer}</pre>
      When we called the function on the client:
      <pre data-testid="client-on-client">{results.clientOnClient}</pre>
    </div>
  {/if}
</div>
