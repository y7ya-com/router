import { mount, unmount } from 'svelte'
import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/svelte-router'
import {
  contextRoute,
  itemDetailsRoute,
  itemsRoute,
  rootRoute,
  searchRoute,
} from './routes'
import Root from './components/Root.svelte'
import ItemsPage from './components/ItemsPage.svelte'
import ItemDetailsPage from './components/ItemDetailsPage.svelte'
import SearchPage from './components/SearchPage.svelte'
import ContextPage from './components/ContextPage.svelte'

rootRoute.update({ component: Root })
itemsRoute.update({ component: ItemsPage })
itemDetailsRoute.update({ component: ItemDetailsPage })
searchRoute.update({ component: SearchPage })
contextRoute.update({ component: ContextPage })

export function mountTestApp(container: Element) {
  const router = createRouter({
    history: createMemoryHistory({
      initialEntries: ['/items/0'],
    }),
    scrollRestoration: true,
    routeTree: rootRoute.addChildren([
      itemsRoute.addChildren([itemDetailsRoute]),
      searchRoute,
      contextRoute,
    ]),
  })

  const app = mount(RouterProvider, {
    target: container,
    props: { router },
  })

  return {
    router,
    unmount() {
      void unmount(app)
    },
  }
}
