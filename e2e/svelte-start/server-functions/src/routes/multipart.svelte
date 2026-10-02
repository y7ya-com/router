<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/multipart')()
</script>

<script lang="ts">
  import { multipartFormDataServerFn } from './-functions/multipart'

  let formRef = $state<HTMLFormElement | null>(null)
  let multipartResult = $state<unknown>({})

  const handleSubmit = (e: Event) => {
    e.preventDefault()

    if (!formRef) {
      return
    }

    const formData = new FormData(formRef)
    multipartFormDataServerFn({ data: formData }).then((data) => {
      multipartResult = data
    })
  }
</script>

<div class="p-2 m-2 grid gap-2">
  <h3>Multipart Server Fn POST Call</h3>
  <div class="overflow-y-auto">
    It should return
    <code>
      <pre data-testid="expected-multipart-server-fn-result">{JSON.stringify({
          value: 'test field value',
          file: { name: 'my_file.txt', size: 9, contents: 'test data' },
        })}</pre>
    </code>
  </div>
  <form
    class="flex flex-col gap-2"
    action={multipartFormDataServerFn.url}
    method="post"
    enctype="multipart/form-data"
    bind:this={formRef}
    data-testid="multipart-form"
  >
    <input type="text" name="input_field" value="test field value" />
    <input
      type="file"
      name="input_file"
      data-testid="multipart-form-file-input"
    />
    <button
      type="submit"
      class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
    >
      Submit (native)
    </button>
    <button
      type="button"
      onclick={handleSubmit}
      class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
    >
      Submit (onClick)
    </button>
  </form>
  <div class="overflow-y-auto">
    <pre data-testid="multipart-form-response">{JSON.stringify(
        multipartResult,
      )}</pre>
  </div>
</div>
