<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { z } from 'zod'

  export const Route = createFileRoute('/formdata-redirect/')({
    validateSearch: z.object({
      mode: z.union([z.literal('js'), z.literal('no-js')]).default('js'),
    }),
  })

  const testValues = {
    name: 'Sean',
  }
</script>

<script lang="ts">
  import { useServerFn } from '@tanstack/svelte-start'
  import { greetUser } from './-functions/index'

  const mode = Route.useSearch({ select: (search) => search.mode })
  const greetUserFn = useServerFn(greetUser)
</script>

<div class="p-2 m-2 grid gap-2">
  <h3>Submit POST FormData Fn Call</h3>
  <div class="overflow-y-auto">
    It should return redirect to /formdata-redirect/target/{testValues.name}
    and greet the user with their name:
    <code>
      <pre
        data-testid="expected-submit-post-formdata-server-fn-result">{testValues.name}</pre>
    </code>
  </div>
  <form
    class="flex flex-col gap-2"
    data-testid="submit-post-formdata-form"
    method="post"
    action={greetUser.url}
    onsubmit={async (evt) => {
      if (mode.current === 'js') {
        evt.preventDefault()
        const data = new FormData(evt.currentTarget)
        await greetUserFn({ data })
      }
    }}
  >
    <input type="text" name="name" value={testValues.name} />
    <button
      type="submit"
      data-testid="test-submit-post-formdata-fn-calls-btn"
      class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
    >
      Submit
    </button>
  </form>
</div>
