# Release flow for github-installable distros

The three github distribution repos are populated from this monorepo by
running `scripts/release-distros.ts`. Each repo holds the built output of
one package, with `workspace:*` deps rewritten to either real npm versions
or github URLs pointing at the sibling distro repos.

## Repos

| Source in monorepo | Distro repo | Installs as |
| --- | --- | --- |
| `packages/svelte-router` | `y7ya-com/svelte-router` | `@tanstack/svelte-router` |
| `packages/router-generator` | `y7ya-com/router-generator` | `@tanstack/router-generator` |
| `packages/router-plugin` | `y7ya-com/router-plugin` | `@tanstack/router-plugin` |
| `packages/svelte-start` | `y7ya-com/svelte-start` | `@tanstack/svelte-start` |
| `packages/svelte-start-client` | `y7ya-com/svelte-start-client` | `@tanstack/svelte-start-client` |
| `packages/svelte-start-server` | `y7ya-com/svelte-start-server` | `@tanstack/svelte-start-server` |

All six release **together, under one tag**. A fork dep is rewritten to
`github:owner/repo#<tag>`, so that tag must exist in every repo the set
references. Never tag one distro without the others.

End-user install:

```bash
pnpm add github:y7ya-com/svelte-start#v0.0.3-experimental
pnpm add -D github:y7ya-com/router-plugin#v0.0.3-experimental
# svelte-router, svelte-start-client/-server and router-generator all come
# in transitively as github deps
```

### Consumers: use npm or bun, not pnpm

`svelte-start` depends on its siblings by github URL, so those are **transitive**
git deps. Support differs:

| Client | Result | Config needed |
| --- | --- | --- |
| npm 11.16 | works | none |
| bun 1.3.9 | works | none |
| pnpm 11.18 | **fails** `ERR_PNPM_EXOTIC_SUBDEP` | `blockExoticSubdeps: false` |

Recommend npm (or bun) to consumers and the problem disappears. If someone must
use pnpm, the setting goes in **`pnpm-workspace.yaml`** — `.npmrc` and the `pnpm`
field of `package.json` are *not* read for it on pnpm 11:

```yaml
blockExoticSubdeps: false
```

The monorepo itself stays on pnpm — it needs `workspace:` and the existing
tooling. This only concerns downstream apps installing the distros.

### `@tanstack/svelte-start` is full-stack — do not bundle it browser-only

It pulls `@tanstack/start-storage-context`, which imports `node:async_hooks`.
A browser-only build fails with `"AsyncLocalStorage" is not exported by
"__vite-browser-external"`. That is expected; build client and server
environments separately, as a real Start app does.

## One-time setup (do once, before the first release)

1. Create three empty repos on GitHub under `y7ya-com`:
   - `svelte-router`
   - `router-generator`
   - `router-plugin`
   Each repo: blank, no README, no LICENSE. The release script will
   populate them.

## Every release

1. From the monorepo root, build all three source packages:
   ```bash
   pnpm --filter @tanstack/svelte-router run build
   pnpm --filter @tanstack/router-generator run build
   pnpm --filter @tanstack/router-plugin run build
   ```

2. Run the release script with the new tag:
   ```bash
   tsx scripts/release-distros.ts v0.0.1-experimental
   ```
   This stages the three distros into `dist-distros/`, with their
   `package.json` `version` set to `0.0.1-experimental`, `workspace:*`
   deps rewritten, and `devDependencies` stripped.

3. The script prints the next git commands. **First release only**:
   ```bash
   for d in svelte-router router-generator router-plugin; do
     cd dist-distros/$d
     git init -b main
     git add -A && git commit -m 'v0.0.1-experimental'
     git tag v0.0.1-experimental
     git remote add origin git@github.com:y7ya-com/$d.git
     git push -u origin main --tags
     cd -
   done
   ```

4. **Subsequent releases** (after the repos already exist):
   ```bash
   for d in svelte-router router-generator router-plugin; do
     cd dist-distros/$d
     git init -b main 2>/dev/null
     git remote add origin git@github.com:y7ya-com/$d.git 2>/dev/null
     git fetch origin main
     git reset --soft origin/main
     git add -A && git commit -m 'v0.0.1-experimental'
     git tag v0.0.1-experimental
     git push origin main --tags
     cd -
   done
   ```
   (or write a small wrapper script — left as an exercise for whoever
   actually runs releases regularly.)

## Sanity checks before pushing

- `dist-distros/<name>/package.json` has the right version, no
  `workspace:*` deps, no `devDependencies`.
- `dist-distros/<name>/dist/` is populated (esm + cjs + .d.ts).
- README and LICENSE were copied across.

## Note on the source-of-truth branch

`y7ya-com/router#feat/svelte-router` remains the canonical source. The
distro repos are byproducts — they're for end-user consumption, never
for code review. If TanStack ever adopts the work officially, they
cherry-pick from `feat/svelte-router` and the distro repos become
irrelevant.
