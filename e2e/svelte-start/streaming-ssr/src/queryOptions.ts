import { queryOptions } from '@tanstack/svelte-query'
import {
  delay,
  makeQueryData,
  queryHeavyItems,
} from '../../../streaming-ssr-fixtures'
import type { QueryData } from '../../../streaming-ssr-fixtures'

export function makeQueryOptions(item: (typeof queryHeavyItems)[number]) {
  return queryOptions({
    queryKey: ['streaming-ssr-query-heavy', item.type, item.id],
    queryFn: async (): Promise<QueryData> => {
      if (item.delayMs > 0) {
        await delay(item.delayMs)
      }

      return makeQueryData(item)
    },
    staleTime: Infinity,
  })
}

export type QueryOptions = ReturnType<typeof makeQueryOptions>
