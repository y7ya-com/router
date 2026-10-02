<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'

  export const Route = createRootRoute({
    head: () => ({
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    }),
  })
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
</script>

<nav
  data-testid="main-nav"
  style:padding="12px 20px"
  style:border-bottom="1px solid #e2e8f0"
  style:display="flex"
  style:align-items="center"
  style:gap="16px"
  style:background-color="#fff"
>
  <Link
    to="/"
    style="color: #0284c7; text-decoration: none"
    data-testid="nav-home"
  >
    Home (Global CSS)
  </Link>
  <Link
    to="/modules"
    style="color: #0284c7; text-decoration: none"
    data-testid="nav-modules"
  >
    CSS Modules
  </Link>
  <Link
    to="/sass-mixin"
    style="color: #0284c7; text-decoration: none"
    data-testid="nav-sass-mixin"
  >
    Sass Mixin
  </Link>
</nav>

<main style:padding="20px">
  <Outlet />
</main>
