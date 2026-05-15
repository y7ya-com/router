#!/usr/bin/env tsx
/**
 * Cross-platform compile + stage step for the ported test corpus.
 *
 * - Scans `<repo>/packages/solid-router/tests/*.test.tsx`
 * - Calls `port(inputPath)` from `./src/cli.ts` for each file
 * - Writes the rewritten test file + fixtures + shared module straight into
 *   `<repo>/packages/svelte-router/tests/compiled/<name>/`
 *
 * Pure Node + ts-morph, no shell. Runs identically on macOS / Linux / Windows.
 * Invoke via `pnpm run compile-tests` (also runs as `pretest:unit`).
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { performance } from 'node:perf_hooks'

import { port } from './src/cli.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PACKAGE_ROOT = resolve(__dirname, '..', '..')
const SOURCE_TESTS_DIR = resolve(PACKAGE_ROOT, '..', 'solid-router', 'tests')
const TARGET_DIR = resolve(PACKAGE_ROOT, 'tests', 'compiled')

function main(): void {
  const started = performance.now()

  let inputs: Array<string>
  try {
    inputs = readdirSync(SOURCE_TESTS_DIR)
      .filter((f) => f.endsWith('.test.tsx'))
      .map((f) => join(SOURCE_TESTS_DIR, f))
      .sort()
  } catch (err) {
    console.error(
      `compile-tests: could not read source tests at ${SOURCE_TESTS_DIR}`,
    )
    console.error(err)
    process.exit(1)
  }

  // Wipe the staging directory each run so renames/removals in the source
  // corpus don't leave stale files behind.
  rmSync(TARGET_DIR, { recursive: true, force: true })
  mkdirSync(TARGET_DIR, { recursive: true })

  let totalFixtures = 0
  let totalSnippets = 0
  let totalTodos = 0
  let okCount = 0
  let failCount = 0

  for (const inputPath of inputs) {
    const name = basename(inputPath).replace(/\.test\.tsx?$/, '')
    const outDir = join(TARGET_DIR, name)
    mkdirSync(outDir, { recursive: true })

    try {
      const result = port(inputPath)

      // Test file
      const outFileName = basename(inputPath).replace(
        /\.test\.tsx?$/,
        '.test.ts',
      )
      writeFileSync(join(outDir, outFileName), result.outputCode)

      // Fixtures
      if (result.fixtures.length > 0) {
        const fixturesDir = join(outDir, 'fixtures')
        mkdirSync(fixturesDir, { recursive: true })
        for (const f of result.fixtures) {
          writeFileSync(join(fixturesDir, f.name), f.content)
        }
      }

      // Optional shared.svelte.ts
      if (result.sharedModule !== null) {
        writeFileSync(join(outDir, 'shared.svelte.ts'), result.sharedModule)
      }

      totalFixtures += result.stats.fixturesEmitted
      totalSnippets += result.stats.snippetsEmitted
      totalTodos += result.stats.todosEmitted
      okCount += 1
    } catch (err) {
      failCount += 1
      console.error(`✗ ${name}`)
      console.error(err instanceof Error ? err.stack ?? err.message : err)
    }
  }

  const elapsedMs = Math.round(performance.now() - started)
  console.log(
    `compile-tests: ${okCount}/${inputs.length} ok` +
      `${failCount > 0 ? ` (${failCount} failed)` : ''}` +
      ` — ${totalFixtures} fixtures, ${totalSnippets} snippets, ${totalTodos} todos in ${elapsedMs}ms`,
  )

  if (failCount > 0) process.exit(1)
}

main()
