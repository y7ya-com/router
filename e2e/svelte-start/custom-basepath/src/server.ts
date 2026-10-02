import handler from '@tanstack/svelte-start/server-entry'

export default {
  fetch(request: Request) {
    return handler.fetch(request)
  },
}
