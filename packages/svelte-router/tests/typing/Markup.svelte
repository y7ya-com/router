<script lang="ts">
  // Route-aware props inferred from markup, the way an app writes them.
  // Negative cases live in components.types.ts: Svelte markup cannot carry
  // `@ts-expect-error`.
  import { Link, MatchRoute, Navigate } from '../../src'
  import './register'
</script>

<Link to="/">home</Link>
<Link to="/posts">posts</Link>
<Link to="/posts/$postId" params={{ postId: '1' }}>post</Link>
<Link
  to="/invoices/$invoiceId"
  params={{ invoiceId: '1' }}
  search={{ page: 1 }}
>
  invoice
</Link>
<Link from="/posts" to="./$postId" params={{ postId: '2' }}>relative</Link>
<Link to="/posts" activeProps={{ class: 'active' }} preload="intent"
  >styled</Link
>

<Navigate to="/posts" />
<MatchRoute to="/posts">on posts</MatchRoute>
<MatchRoute to="/posts/$postId" params={{ postId: '1' }}>
  {#snippet match(params)}{params ? params.postId : 'none'}{/snippet}
</MatchRoute>
