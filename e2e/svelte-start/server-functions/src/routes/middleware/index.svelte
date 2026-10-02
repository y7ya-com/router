<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/middleware/')()
</script>

<script lang="ts">
  // Route.Link exists at runtime but is missing from the route types
  const RouteLink = (Route as any).Link
</script>

<div class="p-8">
  <h1 class="font-bold text-lg">Server functions middleware E2E tests</h1>
  <ul class="list-disc p-4">
    <li>
      <RouteLink
        to="./client-middleware-router"
        data-testid="client-middleware-router-link"
      >
        Client Middleware has access to router instance
      </RouteLink>
    </li>
    <li>
      <RouteLink to="./send-serverFn" data-testid="send-serverFn-link">
        Client Middleware can send server function reference in context
      </RouteLink>
    </li>
    <li>
      <RouteLink
        to="./request-middleware"
        data-testid="request-middleware-link"
        reloadDocument={true}
      >
        Request Middleware in combination with server function
      </RouteLink>
    </li>
  </ul>
</div>
