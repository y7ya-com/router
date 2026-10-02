<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'

  export const Route = createRootRoute()
</script>

<script lang="ts">
  import {
    Link,
    Outlet,
    useBlocker,
    useCanGoBack,
    useLocation,
  } from '@tanstack/svelte-router'
  import { maskedPhotoId, shouldBlockFn } from '../../../shared'

  const pathname = useLocation({ select: (location) => location.pathname })
  const canGoBack = useCanGoBack()

  useBlocker({ shouldBlockFn })
</script>

<nav>
  <span data-testid="loc">{pathname.current}</span>
  <button data-testid="can-go-back" disabled={!canGoBack.current}>
    Back
  </button>
  <Link
    to="/pages/$n"
    params={{ n: '1' }}
    data-testid="p-1"
    activeProps={{ class: 'active' }}
  >
    Page 1
  </Link>
  <Link
    to="/pages/$n"
    params={{ n: '2' }}
    data-testid="p-2"
    activeProps={{ class: 'active' }}
  >
    Page 2
  </Link>
  <Link
    to="/pages/$n"
    params={{ n: '3' }}
    replace
    data-testid="p-3-replace"
    activeProps={{ class: 'active' }}
  >
    Page 3 (replace)
  </Link>
  <Link
    to="/photos/$photoId"
    params={{ photoId: maskedPhotoId }}
    mask={{ to: '/gallery' }}
    data-testid="photo-masked"
    activeProps={{ class: 'active' }}
  >
    Photo (masked)
  </Link>
</nav>
<Outlet />
