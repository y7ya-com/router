#!/usr/bin/env tsx
/**
 * Stage the three github-installable distro packages.
 *
 *   y7ya-com/svelte-router      ← @tanstack/svelte-router
 *   y7ya-com/router-plugin      ← @tanstack/router-plugin
 *   y7ya-com/router-generator   ← @tanstack/router-generator
 *
 * Reads each package's built `dist/` from the monorepo, copies it to a
 * staging dir, rewrites `package.json` so workspace:* deps become real
 * version specifiers (npm versions for upstream packages, github URLs for
 * our forked packages). Output goes to `dist-distros/<name>/`.
 *
 * Then you push each staging dir to its own github repo. The script doesn't
 * push — it stages and prints the next steps.
 *
 * Usage:
 *   tsx scripts/release-distros.ts <version-tag>
 *
 * Example:
 *   tsx scripts/release-distros.ts v0.0.0-experimental
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const STAGING = resolve(REPO_ROOT, 'dist-distros')

// Github owner for the distribution repos. Hardcoded — fork-specific.
const GH_OWNER = 'y7ya-com'

// Map: workspace package → github distro repo name.
// Anything not in this map stays on npm (e.g. router-core, history,
// router-utils, virtual-file-routes — all unmodified, fine to use the
// published npm versions).
const FORK_REPOS: Record<string, string> = {
  '@tanstack/svelte-router': 'svelte-router',
  '@tanstack/router-plugin': 'router-plugin',
  '@tanstack/router-generator': 'router-generator',
}

interface PackageSpec {
  /** Package name (as it appears in package.json `name`). */
  name: string
  /** Source directory inside the monorepo. */
  sourceDir: string
  /** Output directory name under `dist-distros/`. */
  distroName: string
}

const PACKAGES: Array<PackageSpec> = [
  {
    name: '@tanstack/svelte-router',
    sourceDir: 'packages/svelte-router',
    distroName: 'svelte-router',
  },
  {
    name: '@tanstack/router-generator',
    sourceDir: 'packages/router-generator',
    distroName: 'router-generator',
  },
  {
    name: '@tanstack/router-plugin',
    sourceDir: 'packages/router-plugin',
    distroName: 'router-plugin',
  },
]

function readJson(path: string): Record<string, any> {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function writeJson(path: string, data: unknown): void {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
}

/**
 * Rewrite a workspace:* dep to either:
 *   - a `github:owner/repo#tag` spec (if the package is one of our forks), or
 *   - the npm version currently checked out in this monorepo (otherwise).
 *
 * `github:` deps require `git` on the install host. CodeSandbox Devbox,
 * Codespaces, and normal local installs all have it; StackBlitz/WebContainer
 * does not, so the live demo is hosted on CodeSandbox.
 */
function resolveDep(
  depName: string,
  versionTag: string,
): string {
  if (depName in FORK_REPOS) {
    const repo = FORK_REPOS[depName]!
    return `github:${GH_OWNER}/${repo}#${versionTag}`
  }
  // Look up the package's version from its source package.json.
  const candidates = [
    `packages/${depName.replace('@tanstack/', '')}`,
    `packages/${depName}`,
  ]
  for (const c of candidates) {
    const pkgPath = resolve(REPO_ROOT, c, 'package.json')
    if (existsSync(pkgPath)) {
      const version = readJson(pkgPath).version
      return `^${version}`
    }
  }
  throw new Error(
    `Could not resolve dep ${depName} — not in FORK_REPOS and not found under packages/`,
  )
}

function rewritePackageJson(
  pkg: Record<string, any>,
  versionTag: string,
): Record<string, any> {
  const out = structuredClone(pkg)
  out.version = versionTag.replace(/^v/, '')

  for (const field of ['dependencies', 'peerDependencies'] as const) {
    if (!out[field]) continue
    for (const [name, spec] of Object.entries(out[field] as Record<string, string>)) {
      if (typeof spec === 'string' && spec.startsWith('workspace:')) {
        out[field][name] = resolveDep(name, versionTag)
      }
    }
  }

  // Strip devDependencies — distro repos don't need them.
  delete out.devDependencies
  // Strip scripts that don't make sense in distro context (test, build, etc).
  // Keep only what's useful for an installed package.
  out.scripts = {}

  return out
}

function stagePackage(spec: PackageSpec, versionTag: string): void {
  const sourceDir = resolve(REPO_ROOT, spec.sourceDir)
  const distDir = resolve(sourceDir, 'dist')
  const outDir = resolve(STAGING, spec.distroName)

  if (!existsSync(distDir)) {
    throw new Error(
      `${spec.name}: dist/ not found at ${distDir}. ` +
        `Run \`pnpm --filter ${spec.name} run build\` first.`,
    )
  }

  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  // Copy dist/
  cpSync(distDir, resolve(outDir, 'dist'), { recursive: true })

  // Copy README / CHANGELOG / LICENSE if present.
  for (const f of ['README.md', 'CHANGELOG.md', 'LICENSE']) {
    const src = resolve(sourceDir, f)
    if (existsSync(src)) cpSync(src, resolve(outDir, f))
  }

  // Rewrite package.json.
  const pkg = readJson(resolve(sourceDir, 'package.json'))
  const rewritten = rewritePackageJson(pkg, versionTag)
  writeJson(resolve(outDir, 'package.json'), rewritten)

  // Write a tiny note file so anyone landing on the repo via github knows
  // what they're looking at.
  writeFileSync(
    resolve(outDir, '.distro-source'),
    `Generated from y7ya-com/router#feat/svelte-router\n` +
      `Source: ${spec.sourceDir}\n` +
      `Version: ${versionTag}\n` +
      `Do not edit files here — regenerate via scripts/release-distros.ts.\n`,
  )

  console.log(`  ✓ staged ${spec.name} → ${outDir}`)
}

function main(): void {
  const versionTag = process.argv[2]
  if (!versionTag) {
    console.error(
      'usage: tsx scripts/release-distros.ts <version-tag>\n' +
        'example: tsx scripts/release-distros.ts v0.0.0-experimental',
    )
    process.exit(2)
  }
  if (!/^v\d+\.\d+\.\d+/.test(versionTag)) {
    console.error(`version tag must start with v<major>.<minor>.<patch>`)
    process.exit(2)
  }

  console.log(`Staging distro packages for ${versionTag}...`)
  rmSync(STAGING, { recursive: true, force: true })
  mkdirSync(STAGING, { recursive: true })

  for (const pkg of PACKAGES) {
    stagePackage(pkg, versionTag)
  }

  console.log()
  console.log('Next steps (do this once per repo, first time only):')
  console.log()
  for (const pkg of PACKAGES) {
    const repo = FORK_REPOS[pkg.name]!
    console.log(`  # ${repo}:`)
    console.log(`  cd dist-distros/${pkg.distroName}`)
    console.log(`  git init -b main`)
    console.log(`  git add -A && git commit -m '${versionTag}'`)
    console.log(`  git tag ${versionTag}`)
    console.log(`  git remote add origin git@github.com:${GH_OWNER}/${repo}.git`)
    console.log(`  git push -u origin main --tags`)
    console.log(`  cd -`)
    console.log()
  }
  console.log(
    'Subsequent releases (after the repos exist): bump the version arg and re-run,',
  )
  console.log(
    'then `cd dist-distros/<name> && git add -A && git commit -m <tag> && git tag <tag> && git push --tags`.',
  )
}

main()
