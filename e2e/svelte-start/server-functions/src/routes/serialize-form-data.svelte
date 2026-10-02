<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/serialize-form-data')()
</script>

<script lang="ts">
  import { greetUser, testValues } from './-functions/serialize-form-data'

  let formDataResult = $state<unknown>('')
</script>

<div class="p-2 m-2 grid gap-2">
  <h3>Serialize FormData Fn POST Call</h3>
  <div class="overflow-y-auto">
    It should return
    <code>
      <pre
        data-testid="expected-serialize-formdata-server-fn-result">Hello, {testValues.name}! You are {testValues.age +
          testValues.__adder} years old, and your favorite pets are {testValues.pet1},{testValues.pet2}.</pre>
    </code>
  </div>
  <form
    class="flex flex-col gap-2"
    data-testid="serialize-formdata-form"
    onsubmit={(evt: SubmitEvent) => {
      evt.preventDefault()
      const data = new FormData(evt.currentTarget as HTMLFormElement)
      greetUser({ data }).then((result) => {
        formDataResult = result
      })
    }}
  >
    <input type="text" name="name" value={testValues.name} />
    <input type="number" name="age" value={testValues.age} />
    <input type="text" name="pet" value={testValues.pet1} />
    <input type="text" name="pet" value={testValues.pet2} />
    <button
      type="submit"
      data-testid="test-serialize-formdata-fn-calls-btn"
      class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
    >
      Submit
    </button>
  </form>
  <div class="overflow-y-auto">
    <pre data-testid="serialize-formdata-form-response">{JSON.stringify(
        formDataResult,
      )}</pre>
  </div>
</div>
