<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import {
    cons_getFn1,
    cons_postFn1,
    cons_serverGetFn1,
    cons_serverPostFn1,
  } from './-functions/consistent'

  export const Route = createFileRoute('/consistent')({
    loader: async () => {
      const data = await cons_serverGetFn1({ data: { username: 'TEST' } })
      console.log('cons_serverGetFn1', data)
      return { data }
    },
  })
</script>

<script lang="ts">
  let getServerResult = $state<unknown>({})
  let getDirectResult = $state<unknown>({})

  let postServerResult = $state<unknown>({})
  let postDirectResult = $state<unknown>({})
</script>

<div class="p-2 m-2 grid gap-2">
  <h3>Consistent Server Fn GET Calls</h3>
  <p>
    This component checks whether the returned payloads from server function are
    the same, regardless of whether the server function is called directly from
    the client or from within the server function.
  </p>
  <div>
    It should return
    <code>
      <pre data-testid="expected-consistent-server-fns-result">{JSON.stringify({
          payload: { username: 'TEST' },
        })}</pre>
    </code>
  </div>
  <p>
    {`GET: cons_getFn1 called from server cons_serverGetFn1 returns`}
    <br />
    <span data-testid="cons_serverGetFn1-response">
      {JSON.stringify(getServerResult)}
    </span>
  </p>
  <p>
    {`GET: cons_getFn1 called directly returns`}
    <br />
    <span data-testid="cons_getFn1-response">
      {JSON.stringify(getDirectResult)}
    </span>
  </p>
  <p>
    {`POST: cons_postFn1 called from cons_serverPostFn1 returns`}
    <br />
    <span data-testid="cons_serverPostFn1-response">
      {JSON.stringify(postServerResult)}
    </span>
  </p>
  <p>
    {`POST: cons_postFn1 called directly returns`}
    <br />
    <span data-testid="cons_postFn1-response">
      {JSON.stringify(postDirectResult)}
    </span>
  </p>
  <button
    data-testid="test-consistent-server-fn-calls-btn"
    type="button"
    class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
    onclick={() => {
      // GET calls
      cons_serverGetFn1({ data: { username: 'TEST' } }).then((data) => {
        getServerResult = data
      })
      cons_getFn1({ data: { username: 'TEST' } }).then((data) => {
        getDirectResult = data
      })

      // POST calls
      cons_serverPostFn1({ data: { username: 'TEST' } }).then((data) => {
        postServerResult = data
      })
      cons_postFn1({ data: { username: 'TEST' } }).then((data) => {
        postDirectResult = data
      })

      cons_postFn1({ data: { username: 'TEST' } }).then((data) => {
        postDirectResult = data
      })
    }}
  >
    Test Consistent server function responses
  </button>
</div>
