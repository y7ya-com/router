<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { productData } from '../../../shared'

  export const Route = createFileRoute('/shop/$productId')({
    loader: ({ params }) => productData(params.productId),
  })
</script>

<script lang="ts">
  const product = Route.useLoaderData()
</script>

<article>{`${product.current.name}: ${product.current.price}`}</article>
