<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { formEcho, rawResp, streamOut } from '../fns'

  export const Route = createFileRoute('/')({})
</script>

<main
  data-form={formEcho.url}
  data-raw={rawResp.url}
  data-stream={streamOut.url}
>
  server-fn transport benchmark
</main>
