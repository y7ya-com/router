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

End-user install:

```bash
pnpm add github:y7ya-com/svelte-router
pnpm add -D github:y7ya-com/router-plugin
# router-generator is pulled in transitively as a github dep of router-plugin
```

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
