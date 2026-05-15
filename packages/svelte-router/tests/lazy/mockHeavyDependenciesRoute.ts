// This mimics the waiting of heavy dependencies, which need to be streamed in
// before the component is available.
import { createRawSnippet } from 'svelte'

await new Promise((resolve) => setTimeout(resolve, 2500))

const heavySnippet = createRawSnippet(() => ({
  render: () => '<h1>I am sooo heavy</h1>',
}))

export default heavySnippet
