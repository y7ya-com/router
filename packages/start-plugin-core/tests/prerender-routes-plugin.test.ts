import { describe, expect, test } from 'vitest'
import { prerenderRoutesPlugin } from '../src/start-router-plugin/generator-plugins/prerender-routes-plugin'
import type { RouteNode } from '@tanstack/router-generator'

function getPaths(routeNodes: Array<Partial<RouteNode>>) {
  prerenderRoutesPlugin().onRouteTreeChanged!({
    routeNodes: routeNodes as Array<RouteNode>,
  } as any)
  return globalThis.TSS_PRERENDABLE_PATHS?.map((p) => p.path)
}

describe('prerenderRoutesPlugin', () => {
  test('includes routes with a component and skips the rest', () => {
    expect(
      getPaths([
        {
          routePath: '/about',
          filePath: 'about.tsx',
          createFileRouteProps: new Set(['component']),
        },
        {
          routePath: '/api/users',
          filePath: 'api/users.ts',
          createFileRouteProps: new Set(['server']),
        },
        {
          routePath: '/posts/$id',
          filePath: 'posts.$id.tsx',
          createFileRouteProps: new Set(['component']),
        },
      ]),
    ).toEqual(['/', '/about'])
  })

  test('includes single-file component routes', () => {
    expect(
      getPaths([
        {
          routePath: '/about',
          filePath: 'about.svelte',
          createFileRouteProps: new Set(),
        },
      ]),
    ).toEqual(['/', '/about'])
  })
})
