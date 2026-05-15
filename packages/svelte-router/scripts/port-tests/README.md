# port-tests

Solid-to-Svelte test-corpus translator for `@tanstack/svelte-router`.
Reads `packages/solid-router/tests/*.test.tsx` and emits Svelte-runnable
equivalents into `packages/svelte-router/tests/compiled/` (gitignored,
regenerated on every test run via the `pretest:unit` hook).

## Why Solid as input

Solid's reactivity model is the closest cousin to Svelte 5's — each Solid
pattern has a direct rewrite (Solid `createSignal` → Svelte `$state`,
Solid `Accessor<T>` calls → `.current` reads, Solid `<Show>` →
`{#if}`). React's render-driven model would need a much wider
translation surface, so we don't take it as input.

Roughly 97% of JSX-returning lambdas in the Solid test corpus are
trivially translatable — they're route `component:` props with literal
markup (`() => <h1>Index</h1>`) or `render(() => <RouterProvider
router={r}/>)` calls. The remaining 3% need real `.svelte` files because
they contain hooks, in-body `expect()` assertions, or dotted-tag JSX.

## What it does

For each input `*.test.tsx`:

1. **Rewrites imports.** `@solidjs/testing-library` →
   `@testing-library/svelte`. Drops `solid-js` imports. Relocates
   `../src` → `../../../src` since the compiled file lives one level
   deeper.
2. **Lifts trivial JSX lambdas to `createRawSnippet`.** `component:
   () => <h1>Index</h1>` becomes `component: index_snippet` plus a
   top-of-file `const index_snippet = createRawSnippet(() => ({ render:
   () => '<h1>Index</h1>' }))`. Naming uses the JSX inner text or the
   property context (`pendingComponent` → `pending_snippet`).
3. **Extracts complex lambdas to `.svelte` fixtures.** Anything with
   hooks (`createSignal`, `useContext`, or our own TanStack hooks like
   `useRouterState`), in-body `expect()` assertions, or dotted-tag JSX
   (`<ctx.Provider>`) becomes a `.svelte` fixture file with the JSX body
   translated to Svelte template syntax.
4. **Rewrites JSX patterns to Svelte template directives:**
   - JSX ternaries `{a ? <X/> : <Y/>}` → `{#if a}<X/>{:else}<Y/>{/if}`
   - JSX `&&` short-circuits → `{#if cond}<X/>{/if}`
   - `arr.map((x) => <JSX/>)` → `{#each arr as x}<JSX/>{/each}`
   - Render-prop blocks `{(args) => <JSX/>}` → `{#snippet children(args)}<JSX/>{/snippet}`
   - Function declarations with JSX returns → hoisted var-assigned function expressions
5. **Routes closure-captured values through a per-file
   `shared.svelte.ts`** so test-scope variables (e.g. a `vi.fn()`
   captured by an extracted fixture) stay live.
6. **Resolves `routeVar.useNavigate()` / `getRouteApi('/p').useXxx()`**
   to `useXxx({ from: '/p', ... })` via static path resolution, walking
   the AST through `getParentRoute` chains.
7. **Flags genuinely-untranslatable cases as `(null as any /* TODO(svelte-port): ... */)`**.
   ~17 of these remain in the current output, all the same pattern: a
   `vi.fn(() => <JSX/>)` mock whose JSX body is never actually rendered
   by any consuming test — the spy is asserted with `toHaveBeenCalled`
   only, so the `null` return satisfies the type without breaking the
   test.

## Usage

```bash
# Compile + stage into tests/compiled/ (runs automatically before vitest)
pnpm run compile-tests

# Or run vitest, which triggers the pretest hook
pnpm run test:unit
```

The intermediate scratch dir is `<package>/tests/compiled/`, gitignored,
regenerated each run. Wipe it any time with `pnpm run clean`.

## `.j2signore`

`.j2signore` lists tests that should be marked `test.skip(...)` because
they exercise Solid-specific framework behavior with no Svelte
equivalent. Each entry has a one-paragraph reason — see the file for
details. Don't add entries casually; the bar is "fundamentally
incompatible with Svelte's reactivity model" not "haven't gotten around
to fixing it".

## Design notes

- Built on `ts-morph` for AST manipulation. Single file (`src/cli.ts`,
  ~4000 lines) so the entire translation surface lives in one place.
- Designed to run every test cycle. The compiled output is ephemeral
  and never committed.
