# @tanstack/svelte-router

## 0.0.0-experimental

Initial release — experimental community port. Mirrors the
`@tanstack/solid-router` API surface; reactivity primitives swapped from
Solid's `Accessor<T>` to Svelte 5's `{ readonly current: T }`. 623 / 638
tests pass from the upstream Solid corpus (auto-translated by the
internal Solid-to-Svelte test compiler). The 15 skips are documented in
`scripts/port-tests/.j2signore`.

Not affiliated with the official TanStack project. If an official Svelte
adapter ships under this package name, replace this version with the
official one and the API should be drop-in compatible by design.
