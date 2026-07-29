import type { Component, Snippet } from 'svelte'

const SNIPPET_SYMBOL = Symbol.for('svelte.snippet')

export function isSnippet(value: unknown): value is Snippet<Array<unknown>> {
  return (
    typeof value === 'function' &&
    (SNIPPET_SYMBOL in value ||
      Object.getOwnPropertySymbols(value).some((s) =>
        s.description?.includes('snippet'),
      ))
  )
}

export function isComponent(value: unknown): value is Component<any> {
  return typeof value === 'function' && !isSnippet(value)
}
