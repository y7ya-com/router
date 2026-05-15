#!/usr/bin/env tsx
/**
 * Solid → Svelte test-corpus translator.
 *
 * Reads `packages/solid-router/tests/*.test.tsx` and emits Svelte-runnable
 * equivalents under `packages/svelte-router/tests/compiled/`. Solid is the
 * input because its reactivity model is the closest cousin to Svelte 5 —
 * each Solid pattern has a direct rewrite; React's render-driven model
 * would need a much wider translation surface.
 *
 * High-level translations:
 *   - `@solidjs/testing-library` → `@testing-library/svelte`
 *   - `render(() => <X/>)` → `render(X, { props: {...} })`
 *   - trivial JSX lambdas (`component: () => <h1>x</h1>`) → `createRawSnippet`
 *   - complex JSX lambdas (hooks / state / dotted tags) → `.svelte` fixtures
 *   - JSX ternaries / `&&` short-circuits → `{#if}` blocks
 *   - `arr.map((x) => <JSX/>)` → `{#each ... as ...}` blocks
 *   - render-prop blocks → `{#snippet children(args)}` blocks
 *   - closure-captured values → routed through a per-file `_shared` module
 *
 * Cases the compiler can't translate are stubbed as `null as any` with a
 * `// TODO(svelte-port): ...` comment. ~17 of those remain in the current
 * output; all are `vi.fn(() => <inline JSX>)` mocks where the JSX body is
 * never actually rendered by any consuming test — the spy is asserted
 * with `toHaveBeenCalled` only.
 *
 * Usage:
 *   tsx src/cli.ts <input.test.tsx> <output-dir>
 *   tsx src/cli.ts --dry-run <input.test.tsx>
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, basename, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Project, SyntaxKind, Node } from 'ts-morph'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Load the `.j2signore` (jsx-to-svelte) ignore list. Each line is one of:
 *   - `<file-base>::<test-name>` — mark that test as `test.skip(...)`
 *   - `<file-base>` — skip every `test()` in that file
 *   - `# ...` or blank — comment / ignored
 *
 * Resolved relative to the compiler's own directory (next to `src/cli.ts`).
 * Returns a map of `<file-base>` → Set<test-name>, plus a separate set of
 * file bases marked for whole-file skip. The set's special value `'*'` means
 * "skip every test in this file".
 */
function loadIgnoreList(): {
  perFile: Map<string, Set<string>>
} {
  const perFile = new Map<string, Set<string>>()
  // Compiler lives at `scripts/port-tests/src/cli.ts`; the ignore file sits at
  // `scripts/port-tests/.j2signore`.
  const ignorePath = resolve(__dirname, '..', '.j2signore')
  if (!existsSync(ignorePath)) return { perFile }
  const raw = readFileSync(ignorePath, 'utf8')
  for (const rawLine of raw.split('\n')) {
    const line = rawLine.replace(/\s+$/, '')
    if (line.length === 0 || line.startsWith('#')) continue
    const sepIdx = line.indexOf('::')
    let fileBase: string
    let testName: string
    if (sepIdx < 0) {
      fileBase = line.trim()
      testName = '*'
    } else {
      fileBase = line.slice(0, sepIdx).trim()
      testName = line.slice(sepIdx + 2)
    }
    if (!perFile.has(fileBase)) perFile.set(fileBase, new Set())
    perFile.get(fileBase)!.add(testName)
  }
  return { perFile }
}

const IGNORE_LIST = loadIgnoreList()

interface PortResult {
  outputCode: string
  fixtures: Array<{ name: string; content: string }>
  /** When non-null, emit as `<dir>/shared.svelte.ts` alongside the test. */
  sharedModule: string | null
  todos: Array<{ location: string; message: string }>
  stats: {
    importsRewritten: number
    renderCallsRewritten: number
    snippetsEmitted: number
    fixturesEmitted: number
    todosEmitted: number
  }
}

const IMPORT_REWRITES: Record<string, string | null> = {
  '@solidjs/testing-library': '@testing-library/svelte',
  '@testing-library/react': '@testing-library/svelte',
  '@testing-library/react/pure': '@testing-library/svelte',
  '@testing-library/react-hooks': '@testing-library/svelte',
  // Test file moves from `tests/<name>.test.tsx` to
  // `tests/compiled/<name>/<name>.test.ts`, so `../src` -> `../../../src`.
  '../src': '../../../src',
  // Remove framework imports — Svelte fixtures don't need them
  'solid-js': null,
  'solid-js/web': null,
  react: null,
}

const KNOWN_HOOKS = new Set([
  // React/Solid framework hooks
  'useContext',
  'useState',
  'useEffect',
  'useMemo',
  'useCallback',
  'useRef',
  'useReducer',
  'useLayoutEffect',
  'useId',
  'useSyncExternalStore',
  'createSignal',
  'createEffect',
  'createMemo',
  'createResource',
  'createStore',
  'createContext',
  // TanStack Router hooks (our own — they need component scope)
  'useRouter',
  'useRouterState',
  'useMatch',
  'useMatches',
  'useMatchRoute',
  'useParentMatches',
  'useChildMatches',
  'useParams',
  'useSearch',
  'useNavigate',
  'useLocation',
  'useLoaderData',
  'useLoaderDeps',
  'useRouteContext',
  'useBlocker',
  'useCanGoBack',
  'useLinkProps',
])

/** A JSX-returning lambda we'd transform. */
interface LambdaInfo {
  node: Node
  startLine: number
  context: PropertyContext
  /** Single-line trivial markup like `() => <h1>x</h1>` */
  isTrivialMarkup: boolean
  /** Carries hooks, state, dotted tags — needs a fixture .svelte file */
  needsFixture: boolean
  /** Cannot be translated automatically — emit a TODO marker */
  isUnhandled: boolean
  /** Reason flagged hard, for TODO message */
  reason?: string
  /** PascalCase tag names used inside the JSX (informs fixture imports) */
  customComponents: Set<string>
  /** True when the fixture only needs a template + imports (no script logic) */
  canAutoTranslateAsTemplate: boolean
}

type PropertyContext =
  | 'component'
  | 'errorComponent'
  | 'notFoundComponent'
  | 'pendingComponent'
  | 'shellComponent'
  | 'defaultComponent'
  | 'defaultPendingComponent'
  | 'defaultNotFoundComponent'
  | 'defaultErrorComponent'
  | 'Wrap'
  | 'InnerWrap'
  | 'render_call'
  | 'other'

const COMPONENT_PROPERTY_NAMES = new Set<string>([
  'component',
  'errorComponent',
  'notFoundComponent',
  'pendingComponent',
  'shellComponent',
  'defaultComponent',
  'defaultPendingComponent',
  'defaultNotFoundComponent',
  'defaultErrorComponent',
  'Wrap',
  'InnerWrap',
])

function getEnclosingPropertyContext(fn: Node): PropertyContext {
  const parent = fn.getParent()
  if (!parent) return 'other'

  if (parent.getKind() === SyntaxKind.PropertyAssignment) {
    const name = parent.getFirstChildByKind(SyntaxKind.Identifier)?.getText()
    if (name && COMPONENT_PROPERTY_NAMES.has(name)) {
      return name as PropertyContext
    }
  }

  if (
    parent.getKind() === SyntaxKind.JsxExpression &&
    parent.getParent()?.getKind() === SyntaxKind.JsxAttribute
  ) {
    const attrName = parent
      .getParent()!
      .getFirstChildByKind(SyntaxKind.Identifier)
      ?.getText()
    if (attrName && COMPONENT_PROPERTY_NAMES.has(attrName)) {
      return attrName as PropertyContext
    }
  }

  if (parent.getKind() === SyntaxKind.CallExpression) {
    const callee = parent.asKind(SyntaxKind.CallExpression)!.getExpression().getText()
    if (callee === 'render') return 'render_call'
  }

  // `const SomeComponent = () => <JSX/>` — treat as a fixture candidate.
  // We classify as `component_prop` since these are typically used as `component:` props.
  if (parent.getKind() === SyntaxKind.VariableDeclaration) {
    const vd = parent.asKind(SyntaxKind.VariableDeclaration)!
    const name = vd.getNameNode().getText()
    if (/^[A-Z]/.test(name)) {
      return 'component_prop' as PropertyContext
    }
  }

  return 'other'
}

function isJsxNode(node: Node): boolean {
  return (
    node.getKind() === SyntaxKind.JsxElement ||
    node.getKind() === SyntaxKind.JsxSelfClosingElement ||
    node.getKind() === SyntaxKind.JsxFragment
  )
}

function lambdaReturnsJsx(fn: Node): boolean {
  const arrow = fn.asKind(SyntaxKind.ArrowFunction)
  if (arrow) {
    const body = arrow.getBody()
    if (isJsxNode(body)) return true
    if (
      body.getKind() === SyntaxKind.ParenthesizedExpression &&
      body.getFirstDescendant(isJsxNode)
    ) {
      return true
    }
    if (body.getKind() === SyntaxKind.Block) {
      const block = body.asKind(SyntaxKind.Block)!
      return block
        .getDescendantsOfKind(SyntaxKind.ReturnStatement)
        .some((ret) => {
          const expr = ret.getExpression()
          if (!expr) return false
          return isJsxNode(expr) || !!expr.getFirstDescendant(isJsxNode)
        })
    }
  }

  const fexp = fn.asKind(SyntaxKind.FunctionExpression)
  if (fexp) {
    return fexp
      .getBody()
      .getDescendantsOfKind(SyntaxKind.ReturnStatement)
      .some((ret) => {
        const expr = ret.getExpression()
        if (!expr) return false
        return isJsxNode(expr) || !!expr.getFirstDescendant(isJsxNode)
      })
  }

  const fdecl = fn.asKind(SyntaxKind.FunctionDeclaration)
  if (fdecl) {
    const body = fdecl.getBody()
    if (!body) return false
    return body
      .getDescendantsOfKind(SyntaxKind.ReturnStatement)
      .some((ret) => {
        const expr = ret.getExpression()
        if (!expr) return false
        return isJsxNode(expr) || !!expr.getFirstDescendant(isJsxNode)
      })
  }

  return false
}

function classify(fn: Node, context: PropertyContext): LambdaInfo {
  const info: LambdaInfo = {
    node: fn,
    startLine: fn.getStartLineNumber(),
    context,
    isTrivialMarkup: false,
    needsFixture: false,
    isUnhandled: false,
    customComponents: new Set<string>(),
    canAutoTranslateAsTemplate: false,
  }

  // Test-scaffolding lambdas (describe/it callbacks) — skip entirely
  if (context === 'other') {
    return info
  }

  let hasHooks = false
  let hasAssertions = false
  let hasDottedTag = false
  let hasMapping = false
  let hasCustomComponent = false
  let hasJsxExpression = false
  let hasBlockSideEffects = false

  // Block-body lambdas with statements before/after the return are NOT trivial:
  // they have side effects (e.g. `errorComponent: ({error}) => { spy = error; return <></> }`).
  // Treat as fixture so the script captures the side effects.
  {
    const arrow = fn.asKind(SyntaxKind.ArrowFunction)
    const fnBody =
      arrow?.getBody() ??
      fn.asKind(SyntaxKind.FunctionExpression)?.getBody()
    if (fnBody?.getKind() === SyntaxKind.Block) {
      const block = fnBody.asKind(SyntaxKind.Block)!
      for (const stmt of block.getStatements()) {
        if (stmt.getKind() === SyntaxKind.ReturnStatement) continue
        hasBlockSideEffects = true
        break
      }
    }
  }

  // Walk descendants — does the lambda body contain hooks, assertions, mappings, etc.?
  fn.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
    const callee = call.getExpression().getText()
    const finalName = callee.split('.').pop() ?? callee
    if (KNOWN_HOOKS.has(finalName)) hasHooks = true
    if (callee === 'expect' || callee.startsWith('expect(')) hasAssertions = true
    if (callee.endsWith('.map') || /\.map\(\s*\(?\w/.test(call.getText())) {
      hasMapping = true
    }
  })
  // Look for JSX expression interpolations `{expr}` inside JSX content. These
  // require fixture extraction (createRawSnippet emits raw HTML and won't
  // evaluate `{...}`).
  fn.getDescendantsOfKind(SyntaxKind.JsxExpression).forEach((je) => {
    // Skip empty expressions like `{}` (rare)
    if (je.getExpression()) hasJsxExpression = true
  })

  // Walk JSX inside — dotted tags? Custom components?
  const checkTagNode = (tagNode: Node) => {
    if (tagNode.getKind() === SyntaxKind.PropertyAccessExpression) {
      hasDottedTag = true
    } else if (tagNode.getKind() === SyntaxKind.Identifier) {
      const tagName = tagNode.getText()
      // Custom component if starts with uppercase
      if (/^[A-Z]/.test(tagName)) {
        hasCustomComponent = true
        info.customComponents.add(tagName)
      }
    }
  }
  fn.getDescendantsOfKind(SyntaxKind.JsxElement).forEach((jsx) => {
    checkTagNode(jsx.getOpeningElement().getTagNameNode())
  })
  fn.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).forEach((jsx) => {
    checkTagNode(jsx.getTagNameNode())
  })

  // Hard cases get fixtures (or TODO if too weird)
  if (hasHooks) {
    info.needsFixture = true
    info.reason = 'lambda uses hooks (useState/useContext/createSignal/etc.)'
  } else if (hasAssertions) {
    info.needsFixture = true
    info.reason = 'lambda contains inline expect() assertions'
  } else if (hasMapping) {
    info.needsFixture = true
    info.reason = 'lambda uses .map() over JSX'
  } else if (hasCustomComponent) {
    info.needsFixture = true
    info.canAutoTranslateAsTemplate = true
    info.reason =
      'lambda JSX references a custom (PascalCase) component — fixture needed (createRawSnippet emits raw HTML only)'
  } else if (hasJsxExpression) {
    info.needsFixture = true
    info.canAutoTranslateAsTemplate = true
    info.reason =
      'lambda JSX contains `{expr}` interpolation — fixture needed (createRawSnippet emits raw HTML only)'
  } else if (hasBlockSideEffects) {
    info.needsFixture = true
    info.canAutoTranslateAsTemplate = true
    info.reason =
      'lambda body has statements other than the return — side effects need fixture script'
  } else {
    info.isTrivialMarkup = true
  }

  return info
}

/**
 * Extract the JSX body of a JSX-returning arrow function as a string suitable for a Svelte template.
 * Handles expression bodies, parenthesized expressions, and simple block-body returns.
 * Returns null if no clean JSX can be extracted.
 */
/**
 * Find the direct ReturnStatements of a Block — children only, not nested
 * inside function/arrow/method bodies.
 */
function topLevelReturns(block: Node): Array<Node> {
  const out: Array<Node> = []
  const walk = (node: Node) => {
    for (const child of node.getChildren()) {
      const k = child.getKind()
      if (k === SyntaxKind.ReturnStatement) {
        out.push(child)
      } else if (
        k === SyntaxKind.ArrowFunction ||
        k === SyntaxKind.FunctionExpression ||
        k === SyntaxKind.FunctionDeclaration ||
        k === SyntaxKind.MethodDeclaration
      ) {
        // Don't descend into nested functions
        continue
      } else {
        walk(child)
      }
    }
  }
  walk(block)
  return out
}

function arrowJsxBodyText(arrow: Node): string | null {
  const af = arrow.asKind(SyntaxKind.ArrowFunction)
  if (!af) return null
  const bodyNode = af.getBody()

  // Block body: find the single return statement with a JSX expression
  if (bodyNode.getKind() === SyntaxKind.Block) {
    const returns = topLevelReturns(bodyNode)
    if (returns.length !== 1) return null
    const ret = returns[0]!
    const expr = ret.asKind(SyntaxKind.ReturnStatement)!.getExpression()
    if (!expr) return ''
    let text = expr.getText().trim()
    if (text.startsWith('(') && text.endsWith(')')) text = text.slice(1, -1).trim()
    // Empty fragment `<></>` → empty template (script-only fixture).
    if (text === '<></>') return ''
    if (text.startsWith('<>') && text.endsWith('</>')) text = text.slice(2, -3).trim()
    if (text === '') return ''
    // Allow either an element (`<...`) or a Svelte expression block (`{...}`).
    if (!text.startsWith('<') && !text.startsWith('{')) return null
    return text
  }

  let body = bodyNode.getText().trim()
  if (body.startsWith('(') && body.endsWith(')')) body = body.slice(1, -1).trim()
  if (body === '<></>') return ''
  if (body.startsWith('<>') && body.endsWith('</>')) body = body.slice(2, -3).trim()
  if (body === '') return ''
  if (!body.startsWith('<') && !body.startsWith('{')) return null
  return body
}

/**
 * Translate React/Solid JSX to Svelte template:
 *  - className → class
 *  - htmlFor → for
 *  - Escape `{` / `}` inside string attribute values (TanStack Router paths like
 *    `"/files/prefix{-$name}.txt"` are literal strings in JSX, but Svelte
 *    interprets `{...}` as expressions and `$name` is illegal as a rune)
 *  - Replace JSX-in-prop (`prop={<X/>}`) with a TODO marker — proper hand-port
 *    is a `{#snippet prop()}` block
 */
/**
 * Convert Solid `<ErrorBoundary fallback={(err) => <JSX/>}>{children}</ErrorBoundary>`
 * into Svelte `<svelte:boundary>{children}{#snippet failed(err)}<JSX/>{/snippet}</svelte:boundary>`.
 * Uses a brace-aware scanner because attribute values can contain JSX `>`.
 */
function rewriteErrorBoundaryToSvelteBoundary(
  src: string,
  info: { customComponents: Set<string> },
): string {
  const OPEN_TAG = '<ErrorBoundary'
  const CLOSE_TAG = '</ErrorBoundary>'
  let result = ''
  let i = 0
  while (i < src.length) {
    const openIdx = src.indexOf(OPEN_TAG, i)
    if (openIdx < 0) {
      result += src.slice(i)
      break
    }
    // Followed by a word boundary (not `<ErrorBoundaryX...`).
    const after = src.charCodeAt(openIdx + OPEN_TAG.length)
    if (
      (after >= 65 && after <= 90) ||
      (after >= 97 && after <= 122) ||
      (after >= 48 && after <= 57) ||
      after === 95 ||
      after === 36
    ) {
      result += src.slice(i, openIdx + OPEN_TAG.length)
      i = openIdx + OPEN_TAG.length
      continue
    }
    result += src.slice(i, openIdx)
    // Scan attributes until the un-nested `>` that ends the opening tag.
    let j = openIdx + OPEN_TAG.length
    let depth = 0
    while (j < src.length) {
      const c = src[j]!
      if (c === '{') depth++
      else if (c === '}') depth--
      else if (c === '>' && depth === 0) break
      else if (
        (c === '"' || c === "'" || c === '`') &&
        depth === 0
      ) {
        const q = c
        j++
        while (j < src.length && src[j] !== q) {
          if (src[j] === '\\') j++
          j++
        }
      }
      j++
    }
    if (j >= src.length) {
      // Malformed — bail.
      result += src.slice(openIdx)
      break
    }
    const attrs = src.slice(openIdx + OPEN_TAG.length, j)
    const innerStart = j + 1
    const closeIdx = src.indexOf(CLOSE_TAG, innerStart)
    if (closeIdx < 0) {
      result += src.slice(openIdx)
      break
    }
    const inner = src.slice(innerStart, closeIdx)
    // Extract `fallback={...}` — brace-balanced.
    let snippet = ''
    const fbStart = attrs.indexOf('fallback')
    if (fbStart >= 0) {
      let k = fbStart + 'fallback'.length
      while (k < attrs.length && /\s/.test(attrs[k]!)) k++
      if (attrs[k] === '=') {
        k++
        while (k < attrs.length && /\s/.test(attrs[k]!)) k++
        if (attrs[k] === '{') {
          let dep = 1
          const exprStart = k + 1
          k++
          while (k < attrs.length && dep > 0) {
            const cc = attrs[k]!
            if (cc === '{') dep++
            else if (cc === '}') dep--
            if (dep > 0) k++
          }
          const expr = attrs.slice(exprStart, k).trim()
          // Expect `(params) => body` or `(params) => (body)`
          const arrow = expr.match(/^\(([^)]*)\)\s*=>\s*([\s\S]+)$/)
          if (arrow) {
            const paramList = arrow[1]!.trim()
            let body = arrow[2]!.trim()
            if (body.startsWith('(') && body.endsWith(')')) {
              body = body.slice(1, -1).trim()
            }
            snippet = `{#snippet failed(${paramList})}${body}{/snippet}`
          }
        }
      }
    }
    info.customComponents.delete('ErrorBoundary')
    result += `<svelte:boundary>${inner}${snippet}</svelte:boundary>`
    i = closeIdx + CLOSE_TAG.length
  }
  return result
}

/**
 * Try to inline a user-defined helper hook like:
 *   const useFoo = (name: string) => {
 *     const a = postRoute.useSearch({ select: (s) => s[`_${name}`] })
 *     const b = useNavigate()
 *     const setX = (v) => b({ to: '.', search: (p) => ({ ...p, [`_${name}`]: v }) })
 *     return [a, setX] as const
 *   }
 * destructured as `const [X, Y] = useFoo('test')`. We substitute the param
 * value, emit the body as fixture script lines, and bind X/Y to the returned
 * tuple. Returns true if the inlining succeeded.
 */
function tryInlineUserHook(opts: {
  callee: string
  args: ReadonlyArray<Node>
  destructured: string
  sf: Node
  info: { node: Node; customComponents: Set<string> }
  scriptLines: Array<string>
  scriptDeclared: Set<string>
  fixtureImports: Set<string>
  sharedVars: Map<string, string>
  closureCaptured: Set<string>
  closureComponents: Set<string>
}): boolean {
  const {
    callee,
    args,
    destructured,
    sf,
    info,
    scriptLines,
    scriptDeclared,
    fixtureImports,
    sharedVars,
    closureCaptured,
    closureComponents,
  } = opts
  const m = destructured.match(
    /^\[\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\]$/,
  )
  if (!m) return false
  const [, gName, sName] = m
  // Locate the helper's declaration: `const <callee> = (param) => { body... }`
  // Scope it to the test file but prefer the closest enclosing scope of info.node.
  const decls = (sf as any).getDescendantsOfKind(
    SyntaxKind.VariableDeclaration,
  )
  let helperDecl: Node | undefined
  for (const vd of decls) {
    const vdAny = vd as any
    if (vdAny.getNameNode().getText() !== callee) continue
    const init = vdAny.getInitializer()
    if (!init) continue
    if (init.getKind() !== SyntaxKind.ArrowFunction) continue
    helperDecl = init
    break
  }
  if (!helperDecl) return false
  const arrow = (helperDecl as any).asKind(SyntaxKind.ArrowFunction)
  const paramList = arrow.getParameters()
  if (paramList.length !== 1) return false
  const paramName = paramList[0]!.getNameNode().getText()
  // Param value: first arg, must be a string literal for safe substitution.
  if (args.length < 1) return false
  const arg0 = args[0]!
  if (arg0.getKind() !== SyntaxKind.StringLiteral) return false
  const paramVal = arg0
    .asKind(SyntaxKind.StringLiteral)!
    .getLiteralValue()
  // Body must be a block with statements + a final `return [X, Y]`.
  const body = arrow.getBody()
  if (body.getKind() !== SyntaxKind.Block) return false
  const block = body.asKind(SyntaxKind.Block)!
  const stmts = block.getStatements()
  if (stmts.length === 0) return false
  const last = stmts[stmts.length - 1]!
  if (last.getKind() !== SyntaxKind.ReturnStatement) return false
  const retExpr = last.asKind(SyntaxKind.ReturnStatement)!.getExpression()
  if (!retExpr) return false
  // Allow `[X, Y] as const` or just `[X, Y]`.
  let arrLit = retExpr
  if (retExpr.getKind() === SyntaxKind.AsExpression) {
    arrLit = retExpr.asKind(SyntaxKind.AsExpression)!.getExpression()
  }
  if (arrLit.getKind() !== SyntaxKind.ArrayLiteralExpression) return false
  const tupleEls = arrLit
    .asKind(SyntaxKind.ArrayLiteralExpression)!
    .getElements()
  if (tupleEls.length !== 2) return false
  const retGetter = tupleEls[0]!.getText()
  const retSetter = tupleEls[1]!.getText()
  // Substitute the parameter in every statement's text.
  const substituteParam = (text: string): string => {
    // Replace `${paramName}` template-literal placeholders with the literal value.
    let v = text
    // Computed property keys like `[`_${name}`]:` → `_<val>:`.
    v = v.replace(
      new RegExp(
        `\\[\\s*\`([^\`]*?)\\$\\{\\s*${paramName}\\s*\\}([^\`]*?)\`\\s*\\]\\s*:`,
        'g',
      ),
      (_m, pre, post) => `${pre}${paramVal}${post}:`,
    )
    // Template-literal property accesses `s[`_${name}`]` → `s._<val>` when
    // suffix is purely alnum/_/$.
    v = v.replace(
      new RegExp(
        `\\[\\s*\`([^\`]*?)\\$\\{\\s*${paramName}\\s*\\}([^\`]*?)\`\\s*\\]`,
        'g',
      ),
      (_m, pre, post) => {
        const key = pre + paramVal + post
        if (/^[A-Za-z_$][\w$]*$/.test(key)) return '.' + key
        return '["' + key.replace(/"/g, '\\"') + '"]'
      },
    )
    // Bare `paramName` references → paramVal as string literal.
    v = rewriteJsIdent(v, paramName, JSON.stringify(paramVal))
    return v
  }
  // Build emitted lines. The body has hooks like `route.useXxx(...)` and
  // `useNavigate()`. We process each statement:
  // - VariableStatement with `const X = ...` → emit as fixture script line.
  // - Skip the return.
  // For hook calls referenced via `routeVar.useXxx(...)` we need from-resolution.
  // Rewrite `<routeVar>.useXxx(...)` calls inside an initializer to
  // `useXxx({ from: '<path>', ...args })`. Resolves the route's path
  // statically when possible.
  const rewriteRouteHookCall = (init: Node, initText: string): string => {
    if (init.getKind() !== SyntaxKind.CallExpression) return initText
    const ce = init.asKind(SyntaxKind.CallExpression)!
    const calleeExpr = ce.getExpression()
    if (calleeExpr.getKind() !== SyntaxKind.PropertyAccessExpression)
      return initText
    const pae = calleeExpr.asKind(SyntaxKind.PropertyAccessExpression)!
    const obj = pae.getExpression()
    if (obj.getKind() !== SyntaxKind.Identifier) return initText
    const routeVarName = obj.getText()
    const hookName = pae.getNameNode().getText()
    if (!KNOWN_HOOKS.has(hookName)) return initText
    const path = resolveRoutePath(routeVarName, sf as unknown as Node, info.node)
    if (path === null || path.length === 0) return initText
    const ceArgs = ce.getArguments().map((a) => substituteParam(a.getText()))
    const fromOpt = `from: '${path}'`
    let argStr: string
    if (ceArgs.length === 0) {
      argStr = `{ ${fromOpt} }`
    } else {
      const firstArg = ce.getArguments()[0]
      if (firstArg?.getKind() === SyntaxKind.ObjectLiteralExpression) {
        const t = substituteParam(firstArg.getText())
        if (/\bfrom\s*:/.test(t)) argStr = ceArgs.join(', ')
        else if (t === '{}')
          argStr = `{ ${fromOpt} }${ceArgs.length > 1 ? ', ' + ceArgs.slice(1).join(', ') : ''}`
        else
          argStr = ['{ ' + fromOpt + ', ' + t.slice(1, -1).trim() + ' }', ...ceArgs.slice(1)].join(', ')
      } else {
        argStr = [`{ ${fromOpt} }`, ...ceArgs].join(', ')
      }
    }
    return `${hookName}(${argStr})`
  }
  for (let si = 0; si < stmts.length - 1; si++) {
    const s = stmts[si]!
    if (s.getKind() !== SyntaxKind.VariableStatement) {
      // Unsupported shape — bail.
      return false
    }
    const vs = s.asKind(SyntaxKind.VariableStatement)!
    const list = vs.getDeclarationList()
    const kindMatch = list.getText().match(/^(const|let|var)\b/)
    const kind = kindMatch?.[1] ?? 'const'
    for (const vd of vs.getDeclarations()) {
      const declName = vd.getNameNode().getText()
      const init = vd.getInitializer()
      if (!init) continue
      let initText = substituteParam(init.getText())
      // Try to rewrite `routeVar.useXxx(...)` → `useXxx({from: '<path>', ...})`.
      initText = rewriteRouteHookCall(init, initText)
      scriptLines.push(`  ${kind} ${declName} = ${initText}`)
      scriptDeclared.add(declName)
      // Track hook imports — both the rewritten `useXxx` and any other hook
      // referenced as the final identifier of the call.
      const hookMatch = initText.match(/^([A-Za-z_$][\w$]*)\(/)
      if (hookMatch && KNOWN_HOOKS.has(hookMatch[1]!)) {
        fixtureImports.add(hookMatch[1]!)
      }
      if (init.getKind() === SyntaxKind.CallExpression) {
        const ce = init.asKind(SyntaxKind.CallExpression)!
        const calleeText = ce.getExpression().getText()
        const finalName = calleeText.split('.').pop() ?? calleeText
        if (KNOWN_HOOKS.has(finalName)) {
          fixtureImports.add(finalName)
        }
      }
    }
  }
  // Bind the destructured names to the returned tuple values.
  scriptLines.push(
    `  const ${gName} = ${substituteParam(retGetter)}`,
  )
  scriptDeclared.add(gName!)
  // setter can be a function reference. Wrap as a function for `setX(...)` calls.
  const setterText = substituteParam(retSetter)
  scriptLines.push(`  const ${sName} = ${setterText}`)
  scriptDeclared.add(sName!)
  void info
  void fixtureImports
  void sharedVars
  void closureCaptured
  void closureComponents
  return true
}

/**
 * `pascalConcat('routeVar', 'Link')` → `'RouteVarLink'`. Used to build a
 * Svelte-safe alias name for dotted JSX tags like `<routeVar.Link>`.
 */
function pascalConcat(routeVar: string, tag: string): string {
  const head = routeVar.charAt(0).toUpperCase() + routeVar.slice(1)
  return head + tag
}

/**
 * Aliases collected from dotted JSX tags during template translation. Keyed
 * by alias name (`RouteVarLink`), value is the original member-access expr
 * (`routeVar.Link`). Reset for each fixture-extract via `resetDottedAliases`.
 */
const DOTTED_TAG_ALIASES = new Map<string, string>()
function resetDottedAliases(): void {
  DOTTED_TAG_ALIASES.clear()
}
function drainDottedAliases(): Array<{ alias: string; expr: string }> {
  const out = [...DOTTED_TAG_ALIASES.entries()].map(([alias, expr]) => ({
    alias,
    expr,
  }))
  DOTTED_TAG_ALIASES.clear()
  return out
}

function jsxToSvelteTemplate(jsxText: string): string {
  let out = jsxText
    .replace(/(\s)className=/g, '$1class=')
    .replace(/(\s)htmlFor=/g, '$1for=')

  // Dotted-tag rewriting: `<routeVar.Link>` → `<RouteVarLink>` where
  // `RouteVarLink` is a hoisted local alias (`const RouteVarLink = routeVar.Link`).
  // This preserves Solid's `route.Link` semantics — the bound `from` — without
  // requiring Svelte to parse dotted PascalCase JSX tags. The alias is
  // added to a set so a downstream pass can emit the `const` declaration in
  // the fixture script.
  out = out.replace(
    /<([A-Za-z_$][\w$]*)\.([A-Z][\w$]*)\b/g,
    (_m, routeVar, tag) => {
      const alias = pascalConcat(routeVar, tag)
      DOTTED_TAG_ALIASES.set(alias, `${routeVar}.${tag}`)
      return `<${alias}`
    },
  )
  out = out.replace(
    /<\/([A-Za-z_$][\w$]*)\.([A-Z][\w$]*)>/g,
    (_m, routeVar, tag) => {
      const alias = pascalConcat(routeVar, tag)
      return `</${alias}>`
    },
  )

  // Replace JSX-in-prop first (otherwise the `{` escape below would munge it)
  out = out.replace(
    /=\{\s*<[A-Za-z][^>]*\/?>(?:[\s\S]*?<\/[A-Za-z][^>]*>)?\s*\}/g,
    (match) => {
      const trimmed = match.replace(/\s+/g, ' ').slice(0, 80)
      return `={undefined /* TODO(svelte-port): JSX-in-prop: ${trimmed} */}`
    },
  )

  // Escape TanStack Router path-param patterns inside attribute/text contexts.
  // The pattern `{$name}` or `{-$name}` appears as literal characters in JSX
  // string-attribute values (e.g. `to="/files/prefix{-$name}.txt"`), but Svelte
  // interprets unescaped `{...}` as an expression. We only escape those that
  // sit OUTSIDE a `{...}` expression block — refs inside JS expressions need
  // no escaping.
  out = escapePathParamsOutsideExpressions(out)

  // Strip JSX `{/* ... */}` comments — invalid in Svelte template
  out = out.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

  // Expand self-closing HTML tags for non-void elements:
  // `<a attr />` → `<a attr></a>` (Svelte 5 disallows the JSX-style shortcut).
  out = expandSelfClosingHtmlTags(out)

  // Translate JSX ternaries `{cond ? <A/> : <B/>}` → `{#if cond}<A/>{:else}<B/>{/if}`
  out = translateJsxTernaries(out)

  // Translate JSX `&&` short-circuit `{cond && <A/>}` → `{#if cond}<A/>{/if}`
  out = translateJsxAndShortCircuit(out)

  // Replace render-prop blocks `{(args) => <JSX/>}` with a TODO comment — Svelte
  // doesn't support this pattern, so the template won't parse otherwise.
  out = replaceRenderProps(out)

  return out
}

const VOID_HTML_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

function expandSelfClosingHtmlTags(s: string): string {
  // Match `<tag ... />` where tag is lowercase (HTML element).
  // We use a simple regex; complex attribute values shouldn't matter because
  // we only look at the tail `/>`.
  return s.replace(
    /<([a-z][a-z0-9-]*)\b([^<>]*?)\/>/g,
    (match, tagName, attrs) => {
      if (VOID_HTML_ELEMENTS.has(tagName)) return match
      const cleaned = attrs.replace(/\s*$/, '')
      // If the tag spreads `{...props}`, render any forwarded children too —
      // mirrors React/Solid's implicit children-via-props behavior.
      const childrenRender = /\{\s*\.\.\.props\s*\}/.test(cleaned)
        ? '{@render props.children?.()}'
        : ''
      return `<${tagName}${cleaned}>${childrenRender}</${tagName}>`
    },
  )
}

function escapePathParamsOutsideExpressions(s: string): string {
  let out = ''
  let i = 0
  while (i < s.length) {
    const ch = s[i]!
    if (ch === '{') {
      // Two cases: a JSX/Svelte expression block `{...}` OR a literal
      // path-param like `{$name}` / `{-$name}`. The latter is a literal in
      // attribute strings; escape it.
      const litMatch = s.slice(i).match(/^\{(-?\$[a-zA-Z_][a-zA-Z0-9_]*)\}/)
      if (litMatch) {
        out += `&#123;${litMatch[1]}&#125;`
        i += litMatch[0].length
        continue
      }
      // Otherwise, treat as an expression block — walk to matching brace and
      // emit verbatim (no escapes inside).
      const end = findMatchingBrace(s, i)
      if (end < 0) {
        out += ch
        i++
        continue
      }
      out += s.slice(i, end + 1)
      i = end + 1
      continue
    }
    out += ch
    i++
  }
  return out
}

function replaceRenderProps(s: string): string {
  let result = ''
  let i = 0
  while (i < s.length) {
    if (s[i] !== '{') {
      result += s[i]!
      i++
      continue
    }
    const end = findMatchingBrace(s, i)
    if (end < 0) {
      result += s[i]!
      i++
      continue
    }
    const inner = s.slice(i + 1, end)
    // Map-over-JSX: `arr.map((item) => <JSX/>)` → `{#each arr as item}<JSX/>{/each}`
    const mapMatch = tryTranslateMapToEach(inner)
    if (mapMatch !== null) {
      result += mapMatch
      i = end + 1
      continue
    }
    if (containsRawJsx(inner) && /=>/.test(inner)) {
      // Detect attribute context: directly preceded by `=`
      const prev = result.length > 0 ? result[result.length - 1]! : ''
      if (prev === '=') {
        result += `{undefined /* TODO(svelte-port): render-prop attribute */}`
        i = end + 1
        continue
      }
      // Element-children render-prop: `<Tag>{(args) => <JSX/>}</Tag>`.
      // Translate to a `children` snippet: `{#snippet children(args)}<JSX/>{/snippet}`.
      // Heuristic: detect `(args) => (<JSX/>)` shape; if it matches, emit the snippet.
      // For `<MatchRoute>`, we name the snippet `match` instead so the MatchRoute
      // component can distinguish function-style vs plain-content children at
      // runtime (Svelte 5 snippet arity is uniform).
      const parentTag = findEnclosingTagName(result)
      const slotName = parentTag === 'MatchRoute' ? 'match' : 'children'
      const rendered = tryRenderPropToSnippet(inner, slotName)
      if (rendered) {
        result += rendered
        i = end + 1
        continue
      }
      // Otherwise leave a placeholder comment so the template still parses.
      result += `<!-- TODO(svelte-port): render-prop pattern needs hand-port: ${inner
        .replace(/\s+/g, ' ')
        .replace(/-->/g, '--&gt;')
        .slice(0, 80)} -->`
      i = end + 1
    } else {
      result += '{' + inner + '}'
      i = end + 1
    }
  }
  return result
}

/**
 * Try to translate `<expr>.map((item[, idx]) => <JSX/>)` into a Svelte
 * `{#each <expr> as item, idx}<JSX/>{/each}` block. Returns null on failure.
 */
function tryTranslateMapToEach(inner: string): string | null {
  const trimmed = inner.trim()
  // Find the LAST `.map(` at depth 0. The pattern is `<arr-expr>.map(<lambda>)`.
  let mapIdx = -1
  let depth = 0
  for (let k = 0; k < trimmed.length; k++) {
    const c = trimmed[k]!
    if (c === '(' || c === '[' || c === '{') depth++
    else if (c === ')' || c === ']' || c === '}') depth--
    else if (c === '"' || c === "'" || c === '`') {
      const q = c
      k++
      while (k < trimmed.length && trimmed[k] !== q) {
        if (trimmed[k] === '\\') k++
        k++
      }
    } else if (
      c === '.' &&
      depth === 0 &&
      trimmed.slice(k, k + 5) === '.map(' &&
      k > 0 &&
      /[A-Za-z_$0-9\])]/.test(trimmed[k - 1]!)
    ) {
      mapIdx = k
    }
  }
  if (mapIdx < 0) return null
  const arrExpr = trimmed.slice(0, mapIdx)
  // The map(...) arg is a lambda. Find matching `)` after `(item) =>` etc.
  const argsStart = mapIdx + 5
  let pDepth = 1
  let j = argsStart
  while (j < trimmed.length && pDepth > 0) {
    const c = trimmed[j]!
    if (c === '(') pDepth++
    else if (c === ')') pDepth--
    else if (c === '"' || c === "'" || c === '`') {
      const q = c
      j++
      while (j < trimmed.length && trimmed[j] !== q) {
        if (trimmed[j] === '\\') j++
        j++
      }
    }
    if (pDepth > 0) j++
  }
  if (j >= trimmed.length) return null
  // Ensure nothing trails after the `.map(...)` (must be the whole inner).
  if (trimmed.slice(j + 1).trim() !== '') return null
  const lambdaText = trimmed.slice(argsStart, j)

  // Parse `(item, idx?) => body` — handle balanced parens inside the param list
  let lt = lambdaText.trim()
  let paramList: string
  if (lt.startsWith('(')) {
    let pd = 1
    let pi = 1
    while (pi < lt.length && pd > 0) {
      const c = lt[pi]!
      if (c === '(') pd++
      else if (c === ')') pd--
      if (pd > 0) pi++
    }
    if (pd !== 0) return null
    paramList = lt.slice(1, pi)
    lt = lt.slice(pi + 1).trim()
  } else {
    const m = lt.match(/^([A-Za-z_$][\w$]*)\s*/)
    if (!m) return null
    paramList = m[1]!
    lt = lt.slice(m[0]!.length).trim()
  }
  if (!lt.startsWith('=>')) return null
  lt = lt.slice(2).trim()
  // Split params by top-level commas (handle nested parens)
  const params: Array<string> = []
  {
    let cur = ''
    let pd = 0
    for (let k = 0; k < paramList.length; k++) {
      const c = paramList[k]!
      if (c === '(' || c === '[' || c === '{') pd++
      else if (c === ')' || c === ']' || c === '}') pd--
      if (c === ',' && pd === 0) {
        const name = cur.trim().split(':')[0]!.trim()
        if (name) params.push(name)
        cur = ''
      } else {
        cur += c
      }
    }
    const last = cur.trim().split(':')[0]!.trim()
    if (last) params.push(last)
  }
  if (params.length === 0) return null
  let bodyText = lt
  // Block body: `{ const id = ...; return <JSX/> }` — extract the return value
  // and any local declarations.
  let preDecls = ''
  if (bodyText.startsWith('{') && bodyText.endsWith('}')) {
    const blockInner = bodyText.slice(1, -1).trim()
    const retIdx = blockInner.search(/\breturn\b/)
    if (retIdx < 0) return null
    const beforeReturn = blockInner.slice(0, retIdx).trim()
    let returnExpr = blockInner.slice(retIdx + 6).trim()
    if (returnExpr.endsWith(';')) returnExpr = returnExpr.slice(0, -1).trim()
    if (returnExpr.startsWith('(') && returnExpr.endsWith(')')) {
      returnExpr = returnExpr.slice(1, -1).trim()
    }
    bodyText = returnExpr
    if (beforeReturn) preDecls = beforeReturn
  }
  if (bodyText.startsWith('(') && bodyText.endsWith(')')) {
    bodyText = bodyText.slice(1, -1).trim()
  }
  if (bodyText.startsWith('<>') && bodyText.endsWith('</>')) {
    bodyText = bodyText.slice(2, -3).trim()
  }
  if (!bodyText.startsWith('<')) return null
  const translatedBody = jsxToSvelteTemplate(bodyText)
  const eachClause = params.length === 1 ? params[0]! : `${params[0]!}, ${params[1]!}`
  // If there were local declarations, emit them with {@const ...}.
  let decls = ''
  if (preDecls) {
    // Split by `;` at top level, convert each `const X = expr` to `{@const X = expr}`.
    for (const stmt of preDecls.split(/;\s*/)) {
      const m = stmt.match(/^\s*(?:const|let|var)\s+([\w$]+)\s*=\s*([\s\S]+)$/)
      if (m) decls += `{@const ${m[1]} = ${m[2]}}`
    }
  }
  return `{#each ${arrExpr} as ${eachClause}}${decls}${translatedBody}{/each}`
}

/**
 * Try to translate `(args) => (<JSX/>)` (a JSX render-prop) into a Svelte
 * `{#snippet children(args)}<JSX/>{/snippet}` block. Returns null on failure.
 */
/**
 * Walk `result` backwards to find the name of the innermost still-open
 * JSX element. Returns the tag name (e.g. "MatchRoute") or null.
 */
function findEnclosingTagName(result: string): string | null {
  // Track depth by scanning tags from start (simple but works for typical tests).
  const stack: Array<string> = []
  const re = /<\/?([A-Za-z_][\w.]*)\b[^>]*?(\/?)>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(result)) !== null) {
    const isClose = result[m.index + 1] === '/'
    const isSelfClose = m[2] === '/'
    const name = m[1]!
    if (isClose) {
      while (stack.length > 0 && stack[stack.length - 1] !== name) stack.pop()
      if (stack.length > 0) stack.pop()
    } else if (!isSelfClose) {
      stack.push(name)
    }
  }
  return stack.length > 0 ? stack[stack.length - 1]! : null
}

function tryRenderPropToSnippet(
  inner: string,
  snippetName: string = 'children',
): string | null {
  // Strip leading/trailing whitespace
  const trimmed = inner.trim()
  // Match `(args...) => body`
  // We need a balanced-aware match for params and body
  let i = 0
  while (i < trimmed.length && /\s/.test(trimmed[i]!)) i++
  if (trimmed[i] !== '(') return null
  // Find matching close paren
  let depth = 1
  let j = i + 1
  while (j < trimmed.length && depth > 0) {
    const c = trimmed[j]!
    if (c === '(') depth++
    else if (c === ')') depth--
    if (depth > 0) j++
  }
  if (depth !== 0) return null
  const paramList = trimmed.slice(i + 1, j)
  let k = j + 1
  while (k < trimmed.length && /\s/.test(trimmed[k]!)) k++
  if (trimmed[k] !== '=' || trimmed[k + 1] !== '>') return null
  k += 2
  let bodyText = trimmed.slice(k).trim()
  if (bodyText.startsWith('(') && bodyText.endsWith(')')) {
    bodyText = bodyText.slice(1, -1).trim()
  }
  if (bodyText.startsWith('<>') && bodyText.endsWith('</>')) {
    bodyText = bodyText.slice(2, -3).trim()
  }
  if (!bodyText.startsWith('<')) return null
  // Translate the body itself through the same JSX→Svelte pipeline (recursive,
  // but limited to one level — render-prop bodies are usually simple).
  const translatedBody = jsxToSvelteTemplate(bodyText)
  return `{#snippet ${snippetName}(${paramList})}${translatedBody}{/snippet}`
}

/**
 * Find balanced `{...}` blocks and translate JSX-ternary/short-circuit patterns
 * into Svelte `{#if}` blocks. Handles nested braces correctly.
 */
function translateJsxTernaries(s: string): string {
  let out = ''
  let i = 0
  while (i < s.length) {
    const ch = s[i]!
    if (ch !== '{') {
      out += ch
      i++
      continue
    }
    // Find the matching close brace
    const end = findMatchingBrace(s, i)
    if (end < 0) {
      out += ch
      i++
      continue
    }
    const inner = s.slice(i + 1, end)
    const trans = tryTranslateTernary(inner)
    if (trans !== null) {
      out += trans
    } else {
      out += '{' + inner + '}'
    }
    i = end + 1
  }
  return out
}

function translateJsxAndShortCircuit(s: string): string {
  let out = ''
  let i = 0
  while (i < s.length) {
    const ch = s[i]!
    if (ch !== '{') {
      out += ch
      i++
      continue
    }
    const end = findMatchingBrace(s, i)
    if (end < 0) {
      out += ch
      i++
      continue
    }
    const inner = s.slice(i + 1, end)
    const trans = tryTranslateAnd(inner)
    if (trans !== null) {
      out += trans
    } else {
      out += '{' + inner + '}'
    }
    i = end + 1
  }
  return out
}

function findMatchingBrace(s: string, openIdx: number): number {
  // Tracks brace depth + skips string/template literals + JSX nested elements
  let depth = 0
  let i = openIdx
  while (i < s.length) {
    const c = s[i]!
    if (c === '{') {
      depth++
    } else if (c === '}') {
      depth--
      if (depth === 0) return i
    } else if (c === '"' || c === "'") {
      // skip string
      const q = c
      i++
      while (i < s.length && s[i] !== q) {
        if (s[i] === '\\') i++
        i++
      }
    } else if (c === '`') {
      i++
      while (i < s.length && s[i] !== '`') {
        if (s[i] === '\\') i++
        i++
      }
    }
    i++
  }
  return -1
}

function tryTranslateTernary(inner: string): string | null {
  // Find top-level `?` and `:` ignoring nested braces/parens/strings.
  // Pattern: `<cond> ? <thenJsx> : <elseJsx>`
  // Where thenJsx/elseJsx must each start (after trim) with `<` (JSX element)
  // OR be another nested ternary that produces JSX (recursive case is hard;
  // skip for now and let it remain as-is — Svelte will error out only if
  // the original was truly JSX-bearing).

  // Strategy: locate `?` at depth 0, then the matching `:` at depth 0 after it.
  let qIdx = -1
  {
    let d = 0
    for (let k = 0; k < inner.length; k++) {
      const c = inner[k]!
      if (c === '(' || c === '[' || c === '{') d++
      else if (c === ')' || c === ']' || c === '}') d--
      else if (c === '"' || c === "'" || c === '`') {
        const q = c
        k++
        while (k < inner.length && inner[k] !== q) {
          if (inner[k] === '\\') k++
          k++
        }
      } else if (c === '<' && d === 0) {
        // Skip JSX element to avoid catching `?` inside JSX attributes
        const tagClose = findJsxClose(inner, k)
        if (tagClose > k) k = tagClose
      } else if (c === '?' && d === 0) {
        // Ignore `??` (nullish coalescing) and `?.` (optional chaining)
        if (inner[k + 1] === '?' || inner[k + 1] === '.') continue
        qIdx = k
        break
      }
    }
  }
  if (qIdx < 0) return null

  // Find matching `:` at depth 0
  let cIdx = -1
  {
    let d = 0
    for (let k = qIdx + 1; k < inner.length; k++) {
      const c = inner[k]!
      if (c === '(' || c === '[' || c === '{') d++
      else if (c === ')' || c === ']' || c === '}') d--
      else if (c === '"' || c === "'" || c === '`') {
        const q = c
        k++
        while (k < inner.length && inner[k] !== q) {
          if (inner[k] === '\\') k++
          k++
        }
      } else if (c === '<' && d === 0) {
        const tagClose = findJsxClose(inner, k)
        if (tagClose > k) k = tagClose
      } else if (c === '?' && d === 0) {
        // nested ternary — skip its `:`
        if (inner[k + 1] === '?' || inner[k + 1] === '.') continue
        // find its colon and skip past
        let dd = 0
        let kk = k + 1
        while (kk < inner.length) {
          if (inner[kk] === ':' && dd === 0) {
            kk++
            break
          }
          if (inner[kk] === '(' || inner[kk] === '[' || inner[kk] === '{') dd++
          else if (inner[kk] === ')' || inner[kk] === ']' || inner[kk] === '}') dd--
          kk++
        }
        k = kk - 1
      } else if (c === ':' && d === 0) {
        cIdx = k
        break
      }
    }
  }
  if (cIdx < 0) return null

  const cond = inner.slice(0, qIdx).trim()
  let thenE = inner.slice(qIdx + 1, cIdx).trim()
  let elseE = inner.slice(cIdx + 1).trim()
  if (!cond) return null

  // Strip wrapping `(...)` so multi-line `(<JSX/>)` works
  if (thenE.startsWith('(') && thenE.endsWith(')')) thenE = thenE.slice(1, -1).trim()
  if (elseE.startsWith('(') && elseE.endsWith(')')) elseE = elseE.slice(1, -1).trim()

  const looksJsx = (e: string) =>
    e.startsWith('<') || e.startsWith('null') || e === 'undefined'

  if (!looksJsx(thenE) || !looksJsx(elseE)) return null

  return `{#if ${cond}}${thenE}{:else}${elseE}{/if}`
}

function tryTranslateAnd(inner: string): string | null {
  // Pattern: `<cond> && <jsx>`
  // Find top-level `&&` at depth 0
  let andIdx = -1
  let d = 0
  for (let k = 0; k < inner.length - 1; k++) {
    const c = inner[k]!
    if (c === '(' || c === '[' || c === '{') d++
    else if (c === ')' || c === ']' || c === '}') d--
    else if (c === '"' || c === "'" || c === '`') {
      const q = c
      k++
      while (k < inner.length && inner[k] !== q) {
        if (inner[k] === '\\') k++
        k++
      }
    } else if (c === '<' && d === 0) {
      const tagClose = findJsxClose(inner, k)
      if (tagClose > k) k = tagClose
    } else if (c === '&' && inner[k + 1] === '&' && d === 0) {
      andIdx = k
      break
    }
  }
  if (andIdx < 0) return null

  const cond = inner.slice(0, andIdx).trim()
  let rhs = inner.slice(andIdx + 2).trim()
  if (!cond || !rhs) return null
  // Strip wrapping `(...)` so multi-line `(<JSX/>)` works
  if (rhs.startsWith('(') && rhs.endsWith(')')) {
    rhs = rhs.slice(1, -1).trim()
  }
  // Only translate if RHS is JSX-shaped
  if (!rhs.startsWith('<')) return null
  return `{#if ${cond}}${rhs}{/if}`
}

/**
 * Given a `<` at idx, find the offset just after the closing tag (for an
 * element) or the self-closing `/>` (for a self-closing element). Returns the
 * index AFTER the close. If parsing fails returns idx unchanged so the caller
 * can fall back.
 */
function findJsxClose(s: string, idx: number): number {
  // Find tag name
  let i = idx + 1
  while (i < s.length && /[A-Za-z0-9_$.]/.test(s[i]!)) i++
  const tagName = s.slice(idx + 1, i)
  if (!tagName) return idx
  // Skip attributes until '>' or '/>'
  let depth = 0
  while (i < s.length) {
    const c = s[i]!
    if ((c === '"' || c === "'") && depth === 0) {
      const q = c
      i++
      while (i < s.length && s[i] !== q) {
        if (s[i] === '\\') i++
        i++
      }
      i++
      continue
    }
    if (c === '{') {
      depth++
      i++
      continue
    }
    if (c === '}') {
      depth--
      i++
      continue
    }
    if (c === '/' && s[i + 1] === '>' && depth === 0) {
      return i + 2
    }
    if (c === '>' && depth === 0) {
      i++
      // Now scan for matching close tag </tagName>
      let nest = 1
      while (i < s.length && nest > 0) {
        const lt = s.indexOf('<', i)
        if (lt < 0) return idx
        // Check if it's a close tag
        if (s[lt + 1] === '/') {
          // Read the tag name
          let j = lt + 2
          while (j < s.length && /[A-Za-z0-9_$.]/.test(s[j]!)) j++
          const closeName = s.slice(lt + 2, j)
          if (closeName === tagName) {
            nest--
            i = j
            while (i < s.length && s[i] !== '>') i++
            i++
            if (nest === 0) return i
          } else {
            i = lt + 1
          }
        } else if (/[A-Za-z]/.test(s[lt + 1] ?? '')) {
          // Opening tag — find its own close (recursive)
          const innerEnd = findJsxClose(s, lt)
          if (innerEnd === lt) return idx
          if (s.slice(lt, innerEnd).endsWith('/>')) {
            // self-closing — don't increment nest
          } else if (s.slice(lt, innerEnd).match(new RegExp(`</${tagName}>$`))) {
            // already balanced
          } else {
            // an opening element — but we already handled it through recursion
            // so we treat it as fully consumed (nest count unchanged)
          }
          i = innerEnd
        } else {
          i = lt + 1
        }
      }
      return i
    }
    i++
  }
  return idx
}

/** Extract pure JSX content (between opening and closing tags) for createRawSnippet rendering. */
function jsxToHtmlString(jsx: Node): string | null {
  // Only handle the easy case: JSX element/fragment with literal text + plain attribute values.
  // Returns null if the JSX has expression interpolation that's too complex.
  const text = jsx.getText()

  // Strip outer parentheses if any
  let inner = text.trim()
  if (inner.startsWith('(') && inner.endsWith(')')) {
    inner = inner.slice(1, -1).trim()
  }

  // Strip outer JSX fragment notation `<>...</>` — Svelte's createRawSnippet
  // renders the string as raw HTML, but the literal `<>` chars escape as text.
  if (inner.startsWith('<>') && inner.endsWith('</>')) {
    inner = inner.slice(2, -3).trim()
  }

  return inner
}

/**
 * Find identifiers referenced inside a Svelte template body that aren't in
 * `declared`. Used to add `const X = undefined as any` stubs in the fixture
 * script so closure-captured references don't crash with ReferenceError.
 */
function findUndeclaredIdents(
  template: string,
  declared: Set<string>,
): Set<string> {
  // Match identifiers inside `{...}` expressions, attribute values that look
  // like JS (e.g. `prop={x}`), and template literals.
  const idents = new Set<string>()
  // Strip text between tags (those are HTML text); keep braces/attrs/strings.
  const exprRegex = /\{([\s\S]*?)\}|=\{([\s\S]*?)\}|`([\s\S]*?)`/g
  let m: RegExpExecArray | null
  while ((m = exprRegex.exec(template))) {
    const body = m[1] || m[2] || m[3] || ''
    const idRegex = /\b([A-Za-z_$][A-Za-z0-9_$]*)\b/g
    let im: RegExpExecArray | null
    while ((im = idRegex.exec(body))) {
      const id = im[1]!
      // Skip property-access tail: `x.foo` — we want `x`, not `foo`
      const beforeIdx = im.index - 1
      if (beforeIdx >= 0 && body[beforeIdx] === '.') continue
      // Skip object-literal keys: `{ key: value }` — we want value, not key
      const afterIdx = im.index + id.length
      if (afterIdx < body.length && body[afterIdx] === ':') {
        // Could be a key, or a TS type annotation. Heuristic: skip.
        continue
      }
      // Skip reserved words / built-ins (best-effort list)
      if (
        [
          'true',
          'false',
          'null',
          'undefined',
          'this',
          'new',
          'typeof',
          'instanceof',
          'in',
          'of',
          'void',
          'return',
          'if',
          'else',
          'for',
          'while',
          'do',
          'break',
          'continue',
          'function',
          'const',
          'let',
          'var',
          'class',
          'extends',
          'super',
          'try',
          'catch',
          'finally',
          'throw',
          'async',
          'await',
          'yield',
          'as',
          'is',
          'satisfies',
          'keyof',
          'String',
          'Number',
          'Boolean',
          'Object',
          'Array',
          'Math',
          'Date',
          'JSON',
          'console',
          'window',
          'document',
        ].includes(id)
      ) {
        continue
      }
      if (declared.has(id)) continue
      // Skip if id starts with capital — likely a Svelte component (handled elsewhere)
      if (/^[A-Z]/.test(id)) continue
      idents.add(id)
    }
  }
  return idents
}

function snakeName(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .toLowerCase()
}

const CONTEXT_NAME_HINTS: Record<string, string> = {
  defaultPendingComponent: 'pending',
  defaultNotFoundComponent: 'not_found',
  defaultErrorComponent: 'error',
  defaultComponent: 'default',
  pendingComponent: 'pending',
  notFoundComponent: 'not_found',
  errorComponent: 'error',
  shellComponent: 'shell',
  Wrap: 'wrap',
  InnerWrap: 'inner_wrap',
}

/** Generate a variable name for a snippet based on context + text content. */
function snippetNameFor(
  jsxText: string,
  context: PropertyContext,
  used: Set<string>,
): string {
  // Try text content first — more descriptive than context for `component:`
  const textMatch = jsxText.match(/>([A-Za-z][^<]{0,30})</)
  const baseRawText = textMatch?.[1]?.trim()
  const baseText = baseRawText
    ? snakeName(baseRawText).split('_').filter(Boolean).slice(0, 3).join('_')
    : ''
  const baseContext = CONTEXT_NAME_HINTS[context] ?? ''
  const base = baseText || baseContext || 'snippet'
  let name = `${base}_snippet`
  let i = 1
  while (used.has(name)) {
    i++
    name = `${base}_snippet_${i}`
  }
  used.add(name)
  return name
}

function fixtureNameFor(
  desiredName: string | undefined,
  context: PropertyContext,
  used: Set<string>,
): string {
  const baseDesired = desiredName
    ? desiredName.charAt(0).toUpperCase() + desiredName.slice(1)
    : ''
  const baseContext = CONTEXT_NAME_HINTS[context]
    ? CONTEXT_NAME_HINTS[context]!
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('') + 'Component'
    : 'Fixture'
  const base = baseDesired || baseContext
  let name = base
  let i = 1
  while (used.has(name)) {
    i++
    name = `${base}${i}`
  }
  used.add(name)
  return name
}

/** Built-in identifiers we never treat as free variables. */
const BUILTIN_IDENTS = new Set<string>([
  'true',
  'false',
  'null',
  'undefined',
  'this',
  'new',
  'typeof',
  'instanceof',
  'in',
  'of',
  'void',
  'return',
  'if',
  'else',
  'for',
  'while',
  'do',
  'break',
  'continue',
  'function',
  'const',
  'let',
  'var',
  'class',
  'extends',
  'super',
  'try',
  'catch',
  'finally',
  'throw',
  'async',
  'await',
  'yield',
  'as',
  'is',
  'satisfies',
  'keyof',
  'String',
  'Number',
  'Boolean',
  'Object',
  'Array',
  'Math',
  'Date',
  'JSON',
  'console',
  'window',
  'document',
  'globalThis',
  'process',
  'Promise',
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'queueMicrotask',
  'Error',
  'TypeError',
  'RangeError',
  'RegExp',
  'Symbol',
  'Reflect',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  // TypeScript-only / type keywords (commonly appear in script type annotations).
  'any',
  'unknown',
  'never',
  'object',
  'string',
  'number',
  'boolean',
  'symbol',
  'bigint',
  'readonly',
  'type',
  // Svelte 5 runes — built-in compiler intrinsics.
  '$state',
  '$derived',
  '$effect',
  '$props',
  '$bindable',
  '$inspect',
  '$host',
  // Test/router-specific globals
  'vi',
  'expect',
  'describe',
  'test',
  'it',
  'render',
  'screen',
  'cleanup',
  'fireEvent',
  'waitFor',
  'beforeEach',
  'afterEach',
  'beforeAll',
  'afterAll',
])

/**
 * Find param names of arrow-function lambdas (including nested ones), catch
 * clauses, for-loop bindings, and function-statement params inside a code chunk.
 * Handles destructured / typed / rest params, plus the bare-ident single-param
 * form `x => ...`.
 */
function findLambdaParamNames(code: string): Set<string> {
  const out = new Set<string>()
  for (let i = 0; i < code.length - 1; i++) {
    // Skip strings/template literals so `=>` inside them is ignored
    const c = code[i]!
    if (c === '"' || c === "'" || c === '`') {
      const q = c
      i++
      while (i < code.length && code[i] !== q) {
        if (code[i] === '\\') i++
        i++
      }
      continue
    }
    // Arrow function `=>`
    if (c === '=' && code[i + 1] === '>') {
      let j = i - 1
      while (j >= 0 && /\s/.test(code[j]!)) j--
      if (j < 0) continue
      if (code[j] === ')') {
        let depth = 1
        let k = j - 1
        while (k >= 0 && depth > 0) {
          const cc = code[k]!
          if (cc === ')') depth++
          else if (cc === '(') depth--
          if (depth > 0) k--
        }
        if (k < 0) continue
        const paramList = code.slice(k + 1, j)
        extractParamNames(paramList).forEach((n) => out.add(n))
      } else if (/[A-Za-z0-9_$]/.test(code[j]!)) {
        let kEnd = j
        while (kEnd >= 0 && /[A-Za-z0-9_$]/.test(code[kEnd]!)) kEnd--
        const name = code.slice(kEnd + 1, j + 1)
        if (/^[A-Za-z_$]/.test(name)) out.add(name)
      }
      continue
    }
    // Svelte snippet binding: `{#snippet name(params)}` — collect params.
    if (c === '{' && code.slice(i, i + 9) === '{#snippet') {
      const m = code
        .slice(i)
        .match(/^\{#snippet\s+[A-Za-z_$][\w$]*\s*\(([^)]*)\)/)
      if (m && m[1]) {
        extractParamNames(m[1]).forEach((n) => out.add(n))
      }
      continue
    }
    // `catch (e)` / `catch ({a,b})`
    if (
      c === 'c' &&
      code.slice(i, i + 5) === 'catch' &&
      /[\s(]/.test(code[i + 5] ?? '')
    ) {
      let k = i + 5
      while (k < code.length && /\s/.test(code[k]!)) k++
      if (code[k] === '(') {
        let depth = 1
        let kk = k + 1
        while (kk < code.length && depth > 0) {
          const cc = code[kk]!
          if (cc === '(' || cc === '[' || cc === '{') depth++
          else if (cc === ')' || cc === ']' || cc === '}') depth--
          if (depth > 0) kk++
        }
        if (kk < code.length) {
          extractParamNames(code.slice(k + 1, kk)).forEach((n) => out.add(n))
        }
      }
      continue
    }
    // `function name(params)` / `function (params)`
    if (
      c === 'f' &&
      code.slice(i, i + 8) === 'function' &&
      /[\s(*]/.test(code[i + 8] ?? '')
    ) {
      let k = i + 8
      while (k < code.length && /[\s*]/.test(code[k]!)) k++
      // optional function name
      while (k < code.length && /[A-Za-z0-9_$]/.test(code[k]!)) k++
      while (k < code.length && /\s/.test(code[k]!)) k++
      if (code[k] === '(') {
        let depth = 1
        let kk = k + 1
        while (kk < code.length && depth > 0) {
          const cc = code[kk]!
          if (cc === '(' || cc === '[' || cc === '{') depth++
          else if (cc === ')' || cc === ']' || cc === '}') depth--
          if (depth > 0) kk++
        }
        if (kk < code.length) {
          extractParamNames(code.slice(k + 1, kk)).forEach((n) => out.add(n))
        }
      }
      continue
    }
    // `for (const|let|var x` — collect `x`
    if (
      c === 'f' &&
      code.slice(i, i + 3) === 'for' &&
      /[\s(]/.test(code[i + 3] ?? '')
    ) {
      const m = code.slice(i).match(
        /^for\s*\(\s*(?:const|let|var)\s+(\{[^}]*\}|\[[^\]]*\]|[A-Za-z_$][A-Za-z0-9_$]*)/,
      )
      if (m && m[1]) {
        extractParamNames(m[1]).forEach((n) => out.add(n))
      }
      continue
    }
    // `const|let|var X = ...` or `const|let|var { x, y } = ...`
    const m = code.slice(i).match(
      /^(?:const|let|var)\s+(\{[^}]*\}|\[[^\]]*\]|[A-Za-z_$][A-Za-z0-9_$]*)/,
    )
    if (
      m &&
      (i === 0 || /[\s;{(}]/.test(code[i - 1] ?? ' '))
    ) {
      extractParamNames(m[1]!).forEach((n) => out.add(n))
      i += m[0].length - 1
      continue
    }
  }
  return out
}

function extractParamNames(paramList: string): Set<string> {
  const names = new Set<string>()
  if (!paramList.trim()) return names
  // Split by top-level commas
  const parts: Array<string> = []
  let cur = ''
  let depth = 0
  for (let k = 0; k < paramList.length; k++) {
    const c = paramList[k]!
    if (c === '(' || c === '[' || c === '{') {
      depth++
      cur += c
    } else if (c === ')' || c === ']' || c === '}') {
      depth--
      cur += c
    } else if (c === ',' && depth === 0) {
      parts.push(cur)
      cur = ''
    } else if (c === '"' || c === "'" || c === '`') {
      const q = c
      cur += c
      k++
      while (k < paramList.length && paramList[k] !== q) {
        cur += paramList[k]
        if (paramList[k] === '\\') {
          k++
          cur += paramList[k]
        }
        k++
      }
      cur += paramList[k] ?? ''
    } else {
      cur += c
    }
  }
  if (cur.trim()) parts.push(cur)

  for (const part of parts) {
    let p = part.trim()
    // Strip default value (after `=`)
    p = p.replace(/^\.\.\./, '')
    // Strip type annotation: drop everything after the first `:` at depth 0
    let depthT = 0
    for (let k = 0; k < p.length; k++) {
      const c = p[k]!
      if (c === '(' || c === '[' || c === '{') depthT++
      else if (c === ')' || c === ']' || c === '}') depthT--
      else if (c === ':' && depthT === 0) {
        p = p.slice(0, k)
        break
      } else if (c === '=' && depthT === 0 && p[k + 1] !== '>') {
        p = p.slice(0, k)
        break
      }
    }
    p = p.trim()
    if (!p) continue
    if (p.startsWith('{')) {
      // Object destructure pattern
      const inner = p.slice(1, -1)
      // Parse each key:alias or shorthand
      let cd = 0
      let cur2 = ''
      const subParts: Array<string> = []
      for (let k = 0; k < inner.length; k++) {
        const c = inner[k]!
        if (c === '(' || c === '[' || c === '{') cd++
        else if (c === ')' || c === ']' || c === '}') cd--
        if (c === ',' && cd === 0) {
          subParts.push(cur2)
          cur2 = ''
        } else {
          cur2 += c
        }
      }
      if (cur2.trim()) subParts.push(cur2)
      for (const sp of subParts) {
        const trimmed = sp.trim()
        // shorthand: `name` or `name = default`
        // alias: `key: name`
        // rest: `...name`
        const renamed = trimmed.replace(/^\.\.\./, '').trim()
        if (renamed.includes(':')) {
          const alias = renamed.slice(renamed.indexOf(':') + 1).trim()
          const aliasName = alias.split('=')[0]!.trim()
          // Aliases can themselves be destructure patterns; if so, recurse
          if (aliasName.startsWith('{') || aliasName.startsWith('[')) {
            extractParamNames(aliasName).forEach((n) => names.add(n))
          } else if (/^[A-Za-z_$]/.test(aliasName)) {
            names.add(aliasName)
          }
        } else {
          const nm = renamed.split('=')[0]!.trim()
          if (/^[A-Za-z_$]/.test(nm)) names.add(nm)
        }
      }
    } else if (p.startsWith('[')) {
      const inner = p.slice(1, -1)
      // Simple comma-split for array destructure
      for (const sp of inner.split(',')) {
        const t = sp.trim().replace(/^\.\.\./, '')
        const nm = t.split('=')[0]!.trim()
        if (/^[A-Za-z_$]/.test(nm)) names.add(nm)
      }
    } else {
      // Plain identifier
      if (/^[A-Za-z_$]/.test(p)) names.add(p)
    }
  }
  return names
}

/**
 * Scan a chunk of code (template or script) for identifier references, returning
 * those that aren't in `declared`, aren't built-ins, and aren't PascalCase
 * (assumed to be Svelte components or types, which are handled separately).
 */
function scanFreeIdents(code: string, declared: Set<string>): Set<string> {
  const out = new Set<string>()
  // Strip strings/template literals + comments to avoid false positives
  let stripped = code
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
  // Replace string contents with placeholders
  stripped = stripped.replace(/"(?:[^"\\]|\\.)*"/g, '""')
  stripped = stripped.replace(/'(?:[^'\\]|\\.)*'/g, "''")
  // Template literals: keep ${...} content, strip text outside
  stripped = stripped.replace(/`([^`]*)`/g, (_m, body) => {
    // Keep ${...} parts (they reference identifiers)
    const parts: Array<string> = []
    const re = /\$\{([\s\S]*?)\}/g
    let mm: RegExpExecArray | null
    while ((mm = re.exec(body))) parts.push(mm[1]!)
    return '`' + parts.join(' ') + '`'
  })

  const idRe = /\b([A-Za-z_$][A-Za-z0-9_$]*)\b/g
  let m: RegExpExecArray | null
  while ((m = idRe.exec(stripped))) {
    const id = m[1]!
    const idx = m.index
    // Skip if preceded by `.` (property access tail)
    if (idx > 0 && stripped[idx - 1] === '.') continue
    // Skip if preceded by `$` (continuation of a Svelte rune like `$state`)
    if (idx > 0 && stripped[idx - 1] === '$') continue
    // Skip if it's a property name: `X: value` (object literal key)
    // But NOT if it's a label or a type annotation we want to catch.
    // Heuristic: skip if the next non-space character is `:` AND the char
    // before `id` isn't `?` (so we don't kill ternary alternatives).
    const after = stripped.slice(idx + id.length)
    const nextChar = after.replace(/^\s*/, '')[0]
    if (nextChar === ':') {
      // Could be object literal key OR type annotation. Skip — common false-positive case.
      continue
    }
    // Skip declarations: e.g. `const id`, `let id`, `var id`, `function id`, `class id`,
    // `(id: T) =>`, `(id) =>`
    const before = stripped.slice(0, idx)
    const beforeLastTok = before.match(/(\w+|\W)\s*$/)?.[0] ?? ''
    if (/^(const|let|var|function|class|catch)\s*$/.test(beforeLastTok)) continue
    if (declared.has(id)) continue
    if (BUILTIN_IDENTS.has(id)) continue
    out.add(id)
  }
  return out
}

/**
 * Scan a Svelte template body for free identifier references.
 * Excludes attribute names, declared identifiers, and PascalCase tags.
 */
function findFreeVarsInTemplate(
  template: string,
  declared: Set<string>,
): Set<string> {
  // Extract content from `{...}` expressions and `={...}` attribute values
  const out = new Set<string>()
  let i = 0
  while (i < template.length) {
    const ch = template[i]!
    if (ch === '{') {
      const end = findMatchingBrace(template, i)
      if (end < 0) {
        i++
        continue
      }
      const inner = template.slice(i + 1, end)
      // Svelte directive blocks like `{#if expr}`, `{:else if expr}`, `{@const ... }`:
      // scan the expression part for free identifiers; skip the directive
      // keyword itself.
      const dirMatch = inner.trim().match(/^[#:/@][a-zA-Z]+\s*(.*)/s)
      if (/^[#:/@][a-z]/.test(inner.trim())) {
        // `{#snippet name(args)}` — `name` is a snippet binding and `args` are
        // parameters, both bound in scope. Don't flag them as free.
        const snipMatch = inner.match(/^\s*#snippet\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/)
        if (snipMatch) {
          const params = snipMatch[2]!
          for (const p of extractParamNames(params)) declared.add(p)
          i = end + 1
          continue
        }
        // `{#each expr as item, idx}` — declare `item` and `idx`.
        const eachMatch = inner.match(
          /^\s*#each\s+([\s\S]+?)\s+as\s+([A-Za-z_$][\w$]*)\s*(?:,\s*([A-Za-z_$][\w$]*))?\s*(?:\([^)]*\))?\s*$/,
        )
        if (eachMatch) {
          declared.add(eachMatch[2]!)
          if (eachMatch[3]) declared.add(eachMatch[3])
          // Scan expr for free idents
          for (const id of scanFreeIdents(eachMatch[1]!, declared)) out.add(id)
          i = end + 1
          continue
        }
        // `{@const X = ...}` — declare X.
        const constMatch = inner.match(
          /^\s*@const\s+([A-Za-z_$][\w$]*)\s*=\s*([\s\S]+)$/,
        )
        if (constMatch) {
          declared.add(constMatch[1]!)
          for (const id of scanFreeIdents(constMatch[2]!, declared)) out.add(id)
          i = end + 1
          continue
        }
        if (dirMatch && dirMatch[1]) {
          for (const id of scanFreeIdents(dirMatch[1], declared)) out.add(id)
        }
        i = end + 1
        continue
      }
      // Skip render-prop blocks that contain raw JSX — free-var analysis
      // on JSX text is unreliable and these fixtures need hand-porting anyway.
      if (containsRawJsx(inner)) {
        i = end + 1
        continue
      }
      for (const id of scanFreeIdents(inner, declared)) out.add(id)
      i = end + 1
    } else {
      i++
    }
  }
  return out
}

/** Heuristic: does this expression contain a raw JSX element/fragment? */
function containsRawJsx(s: string): boolean {
  // Strip strings to avoid false positives
  let str = s
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/`(?:[^`\\]|\\.)*`/g, '``')
  // JSX element: <X> or <X.../>
  return /<[A-Za-z][A-Za-z0-9_.]*(?:\s[^>]*)?\/?>/.test(str)
}

/**
 * Pattern B: Given a `routeVar.useXxx(...)` call expression, walk the AST
 * to find the route's full literal path. Returns the path string, or null
 * if the path can't be statically resolved.
 *
 * `scopeFrom` is the node where the lookup is happening (e.g. the lambda being
 * extracted). If provided, lookup prefers declarations in the closest enclosing
 * function/block scope; this disambiguates duplicate names across `test(...)`
 * blocks in the same file.
 */
function resolveRoutePath(
  routeVarName: string,
  sf: Node,
  scopeFrom?: Node,
  opts?: { pathlessLayoutFallback?: boolean },
): string | null {
  const allDecls = (sf as any).getDescendantsOfKind(
    SyntaxKind.VariableDeclaration,
  )
  // Try to find the matching declaration in the closest enclosing scope first.
  const scopedDecls: Array<Node> = []
  if (scopeFrom) {
    let cur: Node | undefined = scopeFrom
    while (cur) {
      cur = cur.getParent()
      if (!cur) break
      const kind = cur.getKind()
      if (
        kind === SyntaxKind.Block ||
        kind === SyntaxKind.SourceFile ||
        kind === SyntaxKind.ArrowFunction ||
        kind === SyntaxKind.FunctionExpression ||
        kind === SyntaxKind.FunctionDeclaration ||
        kind === SyntaxKind.MethodDeclaration
      ) {
        const inThis = allDecls.filter((d: Node) => {
          if (d.getNameNode().getText() !== routeVarName) return false
          let p: Node | undefined = d.getParent()
          while (p && p !== cur) p = p.getParent()
          return p === cur
        })
        if (inThis.length > 0) {
          scopedDecls.push(...inThis)
          break
        }
      }
    }
  }
  const decls = scopedDecls.length > 0 ? scopedDecls : allDecls
  for (const vd of decls) {
    if (vd.getNameNode().getText() !== routeVarName) continue
    const init = vd.getInitializer()
    if (!init || init.getKind() !== SyntaxKind.CallExpression) continue
    const call = init.asKind(SyntaxKind.CallExpression)!
    const callee = call.getExpression().getText()
    if (callee !== 'createRoute' && callee !== 'createRootRoute') return null
    if (callee === 'createRootRoute') return ''
    const args = call.getArguments()
    if (args.length === 0) return null
    const objArg = args[0]
    if (objArg.getKind() !== SyntaxKind.ObjectLiteralExpression) return null
    const objLit = objArg.asKind(SyntaxKind.ObjectLiteralExpression)!
    let pathLit: string | null = null
    let parentRouteVar: string | null = null
    let hasId = false
    for (const prop of objLit.getProperties()) {
      if (prop.getKind() !== SyntaxKind.PropertyAssignment) continue
      const pa = prop.asKind(SyntaxKind.PropertyAssignment)!
      const name = pa.getNameNode().getText()
      if (name === 'path') {
        const iv = pa.getInitializer()
        if (iv?.getKind() === SyntaxKind.StringLiteral) {
          pathLit = iv.asKind(SyntaxKind.StringLiteral)!.getLiteralValue()
        } else if (iv?.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
          pathLit = iv.getText().slice(1, -1)
        } else {
          return null
        }
      } else if (name === 'id') {
        hasId = true
      } else if (name === 'getParentRoute') {
        const iv = pa.getInitializer()
        if (iv?.getKind() === SyntaxKind.ArrowFunction) {
          const af = iv.asKind(SyntaxKind.ArrowFunction)!
          const body = af.getBody()
          let parentText: string | null = null
          if (body.getKind() === SyntaxKind.Identifier) {
            parentText = body.getText()
          } else if (body.getKind() === SyntaxKind.ParenthesizedExpression) {
            parentText = body.asKind(SyntaxKind.ParenthesizedExpression)!.getExpression().getText()
          }
          if (parentText) parentRouteVar = parentText
        }
      }
    }
    // Pathless layout routes (no `path`, just an `id`) don't contribute to
    // the URL. When asked about the layout route itself we still return
    // null (no URL-path equivalent), but when this is being walked as a
    // *parent* of another route, the caller treats it as empty (see the
    // join logic below).
    if (pathLit === null) return null
    void hasId
    if (parentRouteVar === null) {
      // No parent — this is a root or unparented route
      return pathLit
    }
    let parentPath = resolveRoutePath(parentRouteVar, sf, vd, opts)
    if (parentPath === null && opts?.pathlessLayoutFallback) {
      // Parent is pathless (layout) — treat its URL contribution as empty
      // so this route still gets a meaningful path. Walk further up to
      // pick up any grand-parents.
      parentPath = resolveRoutePathWithPathlessLayouts(parentRouteVar, sf, vd)
    }
    if (parentPath === null) return null
    // Join paths
    const trimmedParent = parentPath.replace(/\/+$/, '')
    const trimmedSelf = pathLit.replace(/^\/+/, '')
    if (trimmedSelf === '' || trimmedSelf === '/') return trimmedParent || '/'
    return trimmedParent + '/' + trimmedSelf
  }
  return null
}

/**
 * Like `resolveRoutePath`, but treats pathless layout routes (those with
 * only `id`, no `path`) as contributing an empty URL segment instead of
 * being unresolvable. Used when walking up the parent chain.
 */
function resolveRoutePathWithPathlessLayouts(
  routeVarName: string,
  sf: Node,
  scopeFrom?: Node,
): string | null {
  const allDecls = (sf as any).getDescendantsOfKind(
    SyntaxKind.VariableDeclaration,
  )
  const scopedDecls: Array<Node> = []
  if (scopeFrom) {
    let cur: Node | undefined = scopeFrom
    while (cur) {
      cur = cur.getParent()
      if (!cur) break
      const kind = cur.getKind()
      if (
        kind === SyntaxKind.Block ||
        kind === SyntaxKind.SourceFile ||
        kind === SyntaxKind.ArrowFunction ||
        kind === SyntaxKind.FunctionExpression ||
        kind === SyntaxKind.FunctionDeclaration ||
        kind === SyntaxKind.MethodDeclaration
      ) {
        const inThis = allDecls.filter((d: Node) => {
          if (d.getNameNode().getText() !== routeVarName) return false
          let p: Node | undefined = d.getParent()
          while (p && p !== cur) p = p.getParent()
          return p === cur
        })
        if (inThis.length > 0) {
          scopedDecls.push(...inThis)
          break
        }
      }
    }
  }
  const decls = scopedDecls.length > 0 ? scopedDecls : allDecls
  for (const vd of decls) {
    if (vd.getNameNode().getText() !== routeVarName) continue
    const init = vd.getInitializer()
    if (!init || init.getKind() !== SyntaxKind.CallExpression) continue
    const call = init.asKind(SyntaxKind.CallExpression)!
    const callee = call.getExpression().getText()
    if (callee !== 'createRoute' && callee !== 'createRootRoute') return null
    if (callee === 'createRootRoute') return ''
    const args = call.getArguments()
    if (args.length === 0) return null
    const objArg = args[0]
    if (objArg.getKind() !== SyntaxKind.ObjectLiteralExpression) return null
    const objLit = objArg.asKind(SyntaxKind.ObjectLiteralExpression)!
    let pathLit: string | null = null
    let parentRouteVar: string | null = null
    let hasId = false
    for (const prop of objLit.getProperties()) {
      if (prop.getKind() !== SyntaxKind.PropertyAssignment) continue
      const pa = prop.asKind(SyntaxKind.PropertyAssignment)!
      const name = pa.getNameNode().getText()
      if (name === 'path') {
        const iv = pa.getInitializer()
        if (iv?.getKind() === SyntaxKind.StringLiteral) {
          pathLit = iv.asKind(SyntaxKind.StringLiteral)!.getLiteralValue()
        }
      } else if (name === 'id') {
        hasId = true
      } else if (name === 'getParentRoute') {
        const iv = pa.getInitializer()
        if (iv?.getKind() === SyntaxKind.ArrowFunction) {
          const body = iv.asKind(SyntaxKind.ArrowFunction)!.getBody()
          if (body.getKind() === SyntaxKind.Identifier) {
            parentRouteVar = body.getText()
          } else if (body.getKind() === SyntaxKind.ParenthesizedExpression) {
            parentRouteVar = body
              .asKind(SyntaxKind.ParenthesizedExpression)!
              .getExpression()
              .getText()
          }
        }
      }
    }
    // Pathless layout → treat as empty segment, but only if it has an id.
    if (pathLit === null) {
      if (!hasId) return null
      pathLit = ''
    }
    if (parentRouteVar === null) return pathLit
    const parentPath = resolveRoutePathWithPathlessLayouts(
      parentRouteVar,
      sf,
      vd,
    )
    if (parentPath === null) return null
    const trimmedParent = parentPath.replace(/\/+$/, '')
    const trimmedSelf = pathLit.replace(/^\/+/, '')
    if (trimmedSelf === '') return trimmedParent || ''
    if (trimmedParent === '') return '/' + trimmedSelf
    return trimmedParent + '/' + trimmedSelf
  }
  return null
}

/**
 * Compute byte ranges in `code` where `varName` is shadowed by a lambda parameter.
 * Anything inside one of these ranges should NOT be rewritten.
 */
function computeLambdaShadowRanges(
  code: string,
  varName: string,
): Array<[number, number]> {
  const ranges: Array<[number, number]> = []
  for (let i = 0; i < code.length - 1; i++) {
    const c = code[i]!
    if (c === '"' || c === "'" || c === '`') {
      const q = c
      i++
      while (i < code.length && code[i] !== q) {
        if (code[i] === '\\') i++
        i++
      }
      continue
    }
    if (c !== '=' || code[i + 1] !== '>') continue
    // Walk back to find param list bounds
    let j = i - 1
    while (j >= 0 && /\s/.test(code[j]!)) j--
    if (j < 0) continue
    let paramsStart: number
    let paramsEnd: number
    if (code[j] === ')') {
      paramsEnd = j
      let depth = 1
      let k = j - 1
      while (k >= 0 && depth > 0) {
        const cc = code[k]!
        if (cc === ')') depth++
        else if (cc === '(') depth--
        if (depth > 0) k--
      }
      if (k < 0) continue
      paramsStart = k
    } else if (/[A-Za-z0-9_$]/.test(code[j]!)) {
      let kEnd = j
      while (kEnd >= 0 && /[A-Za-z0-9_$]/.test(code[kEnd]!)) kEnd--
      paramsStart = kEnd + 1
      paramsEnd = j + 1
    } else {
      continue
    }
    const paramList = code.slice(paramsStart + (code[paramsStart] === '(' ? 1 : 0), paramsEnd)
    const paramNames = extractParamNames(paramList)
    if (!paramNames.has(varName)) continue
    // Find end of body
    let k = i + 2
    while (k < code.length && /\s/.test(code[k]!)) k++
    if (k >= code.length) continue
    let bodyEnd = code.length
    if (code[k] === '{') {
      // Block body
      let depth = 1
      let m = k + 1
      while (m < code.length && depth > 0) {
        const cc = code[m]!
        if (cc === '"' || cc === "'" || cc === '`') {
          const q = cc
          m++
          while (m < code.length && code[m] !== q) {
            if (code[m] === '\\') m++
            m++
          }
        } else if (cc === '{' || cc === '(' || cc === '[') depth++
        else if (cc === '}' || cc === ')' || cc === ']') depth--
        if (depth > 0) m++
      }
      bodyEnd = m + 1
    } else {
      // Expression body: until next `,` `)` `}` `;` at depth 0
      let depth = 0
      let m = k
      while (m < code.length) {
        const cc = code[m]!
        if (cc === '"' || cc === "'" || cc === '`') {
          const q = cc
          m++
          while (m < code.length && code[m] !== q) {
            if (code[m] === '\\') m++
            m++
          }
        } else if (cc === '(' || cc === '{' || cc === '[') depth++
        else if (cc === ')' || cc === '}' || cc === ']') {
          if (depth === 0) break
          depth--
        } else if (depth === 0 && (cc === ',' || cc === ';')) break
        m++
      }
      bodyEnd = m
    }
    ranges.push([paramsStart, bodyEnd])
  }
  return ranges
}

/**
 * Rewrite a JS-like expression: replace `\bvarName\b` with `replacement`,
 * but skip property-access tails (`.varName`), object/type keys (`varName:`),
 * lambda-shadowed regions, and rewrite object shorthand `{ varName, ... }` →
 * `{ varName: replacement, ... }`.
 */
function rewriteJsIdent(
  code: string,
  varName: string,
  replacement: string,
): string {
  const shadows = computeLambdaShadowRanges(code, varName)
  const inShadow = (pos: number) =>
    shadows.some(([s, e]) => pos >= s && pos < e)

  // Shorthand object property: `{ X, ... }` or `{ ..., X }` → `X: replacement`.
  // Only rewrites when the enclosing bracket is `{` (object literal), not `[`
  // (array literal — `[a, X, b]` would be wrongly rewritten).
  const shorthandRe = new RegExp(`([{,]\\s*)${varName}(\\s*[,}])`, 'g')
  let out = code.replace(shorthandRe, (m, pre: string, post: string, offset: number) => {
    const idPos = offset + pre.length
    if (inShadow(idPos)) return m
    // Walk backwards from idPos to find the innermost unbalanced opener.
    let depth = 0
    let lastOpener: string | null = null
    for (let k = idPos - 1; k >= 0; k--) {
      const cc = code[k]!
      if (cc === ')' || cc === ']' || cc === '}') depth++
      else if (cc === '(' || cc === '[' || cc === '{') {
        if (depth === 0) {
          lastOpener = cc
          break
        }
        depth--
      }
    }
    if (lastOpener !== '{') return m
    return `${pre}${varName}: ${replacement}${post}`
  })
  // Recompute shadow ranges if string length changed (offsets shifted) — but
  // simplest: shadow check on the ORIGINAL offsets is good enough for the
  // bare-ref pass below since we only insert chars rather than remove. Bare-ref
  // pass uses the new `out` so offsets may differ; recompute to be safe.
  const shadows2 =
    out === code ? shadows : computeLambdaShadowRanges(out, varName)
  const inShadow2 = (pos: number) =>
    shadows2.some(([s, e]) => pos >= s && pos < e)
  const bareRe = new RegExp(`\\b${varName}\\b`, 'g')
  out = out.replace(bareRe, (m, offset: number) => {
    if (offset > 0 && out[offset - 1] === '.') return m
    if (offset > 0 && out[offset - 1] === '$') return m
    if (inShadow2(offset)) return m
    const after = out.slice(offset + m.length)
    if (/^\s*:/.test(after)) return m
    return replacement
  })
  return out
}

/**
 * Rewrite identifiers inside a Svelte template string. Only touches expressions
 * inside `{...}` blocks; never touches attribute names, tag names, or text.
 */
function rewriteTemplateIdent(
  template: string,
  varName: string,
  replacement: string,
): string {
  let out = ''
  let i = 0
  while (i < template.length) {
    const ch = template[i]!
    if (ch !== '{') {
      out += ch
      i++
      continue
    }
    const end = findMatchingBrace(template, i)
    if (end < 0) {
      out += ch
      i++
      continue
    }
    const inner = template.slice(i + 1, end)
    const trimmed = inner.trim()
    if (/^[#:/@][a-z]/.test(trimmed)) {
      // `{#snippet name(args)}` — DON'T rewrite name OR params; they're a binding declaration.
      if (/^\s*#snippet\s/.test(inner)) {
        out += '{' + inner + '}'
      } else if (/^\s*#each\s/.test(inner)) {
        // `{#each <expr> as <name>[, <idx>]}` — rewrite only the expr part;
        // `<name>` and `<idx>` are local bindings.
        const m = inner.match(
          /^(\s*#each\s+)([\s\S]+?)(\s+as\s+[A-Za-z_$][\w$]*\s*(?:,\s*[A-Za-z_$][\w$]*)?\s*(?:\([^)]*\))?\s*)$/,
        )
        if (m) {
          out += '{' + m[1] + rewriteJsIdent(m[2]!, varName, replacement) + m[3] + '}'
        } else {
          out += '{' + inner + '}'
        }
      } else if (/^\s*@const\s/.test(inner)) {
        // `{@const X = expr}` — rewrite only the expr part; X is a local binding.
        const m = inner.match(/^(\s*@const\s+[A-Za-z_$][\w$]*\s*=\s*)([\s\S]+)$/)
        if (m) {
          out += '{' + m[1] + rewriteJsIdent(m[2]!, varName, replacement) + '}'
        } else {
          out += '{' + inner + '}'
        }
      } else {
        // Svelte block directive: `{#if expr}`, `{:else if expr}`, etc.
        // Rewrite identifiers in the expression body (after the directive keyword).
        const m = inner.match(/^(\s*[#:/@][a-zA-Z]+)(\s+|$)/)
        if (m) {
          const exprPart = inner.slice(m[0]!.length)
          out += '{' + m[1] + m[2] + rewriteJsIdent(exprPart, varName, replacement) + '}'
        } else {
          out += '{' + inner + '}'
        }
      }
    } else {
      out += '{' + rewriteJsIdent(inner, varName, replacement) + '}'
    }
    i = end + 1
  }
  return out
}

export function port(inputPath: string): PortResult {
  const code = readFileSync(inputPath, 'utf8')
  const project = new Project({
    useInMemoryFileSystem: false,
    compilerOptions: { target: 99, jsx: 1, allowJs: false },
    skipAddingFilesFromTsConfig: true,
  })
  const sf = project.createSourceFile(inputPath + '.tmp.tsx', code, {
    overwrite: true,
  })

  const stats = {
    importsRewritten: 0,
    renderCallsRewritten: 0,
    snippetsEmitted: 0,
    fixturesEmitted: 0,
    todosEmitted: 0,
  }
  const todos: PortResult['todos'] = []
  const fixtures: PortResult['fixtures'] = []

  // ----- Step 1: Rewrite imports -----
  // The test file is being relocated from `tests/<name>.test.tsx` to
  // `tests/compiled/<name>/<name>.test.ts` (two extra levels down), so
  // any relative import needs two more `../` prefixes.
  const imports = sf.getImportDeclarations()
  for (const imp of imports) {
    const mod = imp.getModuleSpecifierValue()
    if (mod in IMPORT_REWRITES) {
      const target = IMPORT_REWRITES[mod]
      if (target === null) {
        imp.remove()
      } else {
        imp.setModuleSpecifier(target)
      }
      stats.importsRewritten++
    } else if (mod.startsWith('../src/')) {
      // Subpath imports of the router source, e.g. `../src/RouterProvider`.
      // Many Svelte components are `.svelte` files so the bare path won't
      // resolve. Redirect to the package index which re-exports them.
      const sub = mod.slice('../src/'.length)
      // Components defined as .svelte files: rewrite to the index entry.
      const SVELTE_COMPONENT_NAMES = new Set([
        'RouterProvider',
        'Link',
        'Matches',
        'Match',
        'Outlet',
        'MatchRoute',
        'ClientOnly',
        'Block',
        'Await',
        'CatchBoundary',
        'CatchNotFound',
        'DefaultGlobalNotFound',
        'Scripts',
        'HeadContent',
        'ScriptOnce',
        'Asset',
        'ScrollRestoration',
        'Transitioner',
      ])
      if (SVELTE_COMPONENT_NAMES.has(sub)) {
        imp.setModuleSpecifier('../../../src')
      } else {
        imp.setModuleSpecifier('../../../src/' + sub)
      }
      stats.importsRewritten++
    } else if (mod.startsWith('./')) {
      // Local sibling helper (e.g. `./utils`, `./lazy/heavy`). After
      // relocating two levels deeper, prefix with `../../`.
      imp.setModuleSpecifier(mod.replace(/^\.\//, '../../'))
      stats.importsRewritten++
    }
  }

  // ----- Step 1a: Rewrite dynamic imports `import('./foo')` -----
  sf.forEachDescendant((node) => {
    if (node.getKind() !== SyntaxKind.CallExpression) return
    const call = node as import('ts-morph').CallExpression
    if (call.getExpression().getKind() !== SyntaxKind.ImportKeyword) return
    const args = call.getArguments()
    if (args.length !== 1) return
    const arg = args[0]
    if (arg.getKind() !== SyntaxKind.StringLiteral) return
    const lit = arg as import('ts-morph').StringLiteral
    const v = lit.getLiteralValue()
    if (v.startsWith('./')) {
      lit.setLiteralValue(v.replace(/^\.\//, '../../'))
      stats.importsRewritten++
    } else if (v.startsWith('../src/')) {
      lit.setLiteralValue(v.replace(/^\.\.\/src\//, '../../../src/'))
      stats.importsRewritten++
    } else if (v === '../src') {
      lit.setLiteralValue('../../../src')
      stats.importsRewritten++
    }
  })

  // ----- Step 1b: Translate Solid `createContext<T>()` to a `Symbol()` key.
  // Svelte's context API uses arbitrary keys with setContext/getContext, so
  // we just need a unique identifier. The Provider JSX is handled separately.
  sf.forEachDescendant((node) => {
    if (node.getKind() !== SyntaxKind.CallExpression) return
    const call = node as import('ts-morph').CallExpression
    const callee = call.getExpression()
    if (callee.getKind() !== SyntaxKind.Identifier) return
    if (callee.getText() !== 'createContext') return
    call.replaceWithText(`Symbol()`)
  })

  // Ensure `createRawSnippet` is imported from 'svelte' (we may need it)
  const needsCreateRawSnippet = { value: false }

  const usedFixtureNames = new Set<string>()

  // Collect the names imported from `../src` (the router package) in the test
  // file. Fixtures can import these directly rather than routing through
  // `_shared`. This prevents legitimate adapter exports from being treated
  // as closure-captured.
  const srcImports = new Set<string>()
  for (const imp of sf.getImportDeclarations()) {
    const mod = imp.getModuleSpecifierValue()
    // Accept any subpath of the router package source: `../src`,
    // `../src/foo`, `../../../src/bar`, etc.
    if (
      mod === '../src' ||
      mod.startsWith('../src/') ||
      mod === '../../../src' ||
      mod.startsWith('../../../src/')
    ) {
      for (const ni of imp.getNamedImports()) {
        srcImports.add(ni.getName())
      }
    }
  }

  // ----- Step 1.5: Convert FunctionDeclarations with JSX returns to var-assigned
  // FunctionExpressions so the standard fixture-extraction loop handles them
  // (Pattern C). For example:
  //   function MyComponent(props) { return <JSX/> }
  // becomes:
  //   var MyComponent = function MyComponent(props) { return <JSX/> }
  // We track each rewritten declaration so we can hoist the final
  // `var X = FixtureName` binding to the top of the enclosing function/block
  // (matching the source's FunctionDeclaration hoisting semantics).
  const funcDeclHoistInfos: Array<{ name: string; ownerBlock: Node }> = []
  {
    const funcDecls = sf.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
    const candidates: Array<Node> = []
    for (const fd of funcDecls) {
      const nameNode = fd.getNameNode()
      if (!nameNode) continue
      const fnName = nameNode.getText()
      if (!/^[A-Z]/.test(fnName)) continue
      if (!lambdaReturnsJsx(fd)) continue
      candidates.push(fd)
    }
    candidates.sort((a, b) => b.getStart() - a.getStart())
    for (const fd of candidates) {
      const fdDecl = fd.asKind(SyntaxKind.FunctionDeclaration)!
      const fnName = fdDecl.getNameNode()!.getText()
      // Track enclosing Block to hoist to later. SourceFile is fine too.
      let ownerBlock: Node = fd.getParent() ?? sf
      while (
        ownerBlock &&
        ownerBlock.getKind() !== SyntaxKind.Block &&
        ownerBlock.getKind() !== SyntaxKind.SourceFile
      ) {
        ownerBlock = ownerBlock.getParent() ?? sf
      }
      const paramsText = `(${fdDecl
        .getParameters()
        .map((p) => p.getText())
        .join(', ')})`
      const body = fdDecl.getBody()
      if (!body) continue
      const bodyText = body.getText()
      const replacement = `var ${fnName} = function ${fnName}${paramsText} ${bodyText}`
      fd.replaceWithText(replacement)
      funcDeclHoistInfos.push({ name: fnName, ownerBlock })
      // Reserve the original name so the fixture extraction picks a distinct
      // fixture name (we don't want `var X = X` self-references).
      usedFixtureNames.add(fnName)
    }
  }

  // Now collect the lambda candidates from the (modified) source.
  const arrows = sf.getDescendantsOfKind(SyntaxKind.ArrowFunction)
  const funcExprs = sf.getDescendantsOfKind(SyntaxKind.FunctionExpression)
  const candidates: Array<Node> = [...arrows, ...funcExprs]

  // Collect lambda infos
  const lambdaInfos: Array<LambdaInfo> = []
  for (const fn of candidates) {
    if (!lambdaReturnsJsx(fn)) continue
    const ctx = getEnclosingPropertyContext(fn)
    if (ctx === 'other') continue
    const info = classify(fn, ctx)
    lambdaInfos.push(info)
  }

  // Sort by position (descending) so we can rewrite without invalidating offsets
  lambdaInfos.sort((a, b) => b.node.getStart() - a.node.getStart())

  const usedSnippetNames = new Set<string>()
  const snippetDeclarations: Array<string> = []

  // Per-file closure-capture state:
  //   sharedVarTypes: name -> TS type annotation (string or 'any')
  //   sharedVarRefs:  list of original lambda nodes (so we can find their scope later)
  const sharedVars = new Map<string, string>()
  // Track names that fixtures rewrite to `_shared.X` — we use this to also
  // rewrite the matching declarations in the test file later.
  const closureCaptured = new Set<string>()

  for (const info of lambdaInfos) {
    // Special case: `component: () => <X/>` (bare self-closing custom component, no props) → `component: X`
    // This skips both snippet and fixture emission — Svelte accepts a Component directly.
    if (info.context !== 'render_call' && info.context !== 'other') {
      const arrow = info.node.asKind(SyntaxKind.ArrowFunction)
      if (arrow) {
        const body = arrow.getBody()
        let jsxNode: Node | undefined
        if (isJsxNode(body)) jsxNode = body
        else if (body.getKind() === SyntaxKind.ParenthesizedExpression) {
          jsxNode = body.getFirstDescendant(isJsxNode)
        }
        if (jsxNode?.getKind() === SyntaxKind.JsxSelfClosingElement) {
          const sce = jsxNode.asKind(SyntaxKind.JsxSelfClosingElement)!
          const tagNode = sce.getTagNameNode()
          const attrs = sce.getAttributes()
          if (
            attrs.length === 0 &&
            tagNode.getKind() === SyntaxKind.Identifier &&
            /^[A-Z]/.test(tagNode.getText())
          ) {
            arrow.replaceWithText(tagNode.getText())
            continue
          }
        }
      }
    }

    // Special case: `render(() => <X p1={v1} p2={v2}/>)` → `render(X, { props: { p1: v1, p2: v2 } })`
    if (info.context === 'render_call') {
      const arrow = info.node.asKind(SyntaxKind.ArrowFunction)
      if (arrow) {
        const body = arrow.getBody()
        let jsxNode: Node | undefined
        if (isJsxNode(body)) {
          jsxNode = body
        } else if (body.getKind() === SyntaxKind.ParenthesizedExpression) {
          jsxNode = body.getFirstDescendant(isJsxNode)
        }
        // If the JSX element has non-empty children, this isn't a simple
        // `render(C, { props })` rewrite — we need a real fixture so the
        // children get rendered. Fall through to the fixture path below.
        if (jsxNode && jsxNode.getKind() === SyntaxKind.JsxElement) {
          const je = jsxNode.asKind(SyntaxKind.JsxElement)!
          const hasMeaningfulChildren = je
            .getJsxChildren()
            .some(
              (c) =>
                c.getKind() !== SyntaxKind.JsxText ||
                c.getText().trim().length > 0,
            )
          if (hasMeaningfulChildren) {
            info.needsFixture = true
            // fall through to the standard fixture-emit branch below
          }
        }
        if (
          !info.needsFixture &&
          jsxNode &&
          (jsxNode.getKind() === SyntaxKind.JsxElement ||
            jsxNode.getKind() === SyntaxKind.JsxSelfClosingElement)
        ) {
          const openingEl =
            jsxNode.asKind(SyntaxKind.JsxElement)?.getOpeningElement() ??
            jsxNode.asKind(SyntaxKind.JsxSelfClosingElement)
          const tagText = openingEl!.getTagNameNode().getText()
          const attrs = openingEl!.getAttributes()
          const propsParts: Array<string> = []
          let unhandled = false
          for (const attr of attrs) {
            if (attr.getKind() === SyntaxKind.JsxAttribute) {
              const jsxAttr = attr.asKind(SyntaxKind.JsxAttribute)!
              const attrName = jsxAttr.getNameNode().getText()
              const initializer = jsxAttr.getInitializer()
              if (!initializer) {
                propsParts.push(`${attrName}: true`)
              } else if (initializer.getKind() === SyntaxKind.StringLiteral) {
                propsParts.push(`${attrName}: ${initializer.getText()}`)
              } else if (initializer.getKind() === SyntaxKind.JsxExpression) {
                const inner = initializer
                  .asKind(SyntaxKind.JsxExpression)!
                  .getExpression()
                if (inner) {
                  propsParts.push(`${attrName}: ${inner.getText()}`)
                }
              } else {
                unhandled = true
              }
            } else if (attr.getKind() === SyntaxKind.JsxSpreadAttribute) {
              propsParts.push(
                `...${attr.asKind(SyntaxKind.JsxSpreadAttribute)!.getExpression().getText()}`,
              )
            }
          }
          if (!unhandled) {
            const propsObj = propsParts.length > 0
              ? `{ ${propsParts.join(', ')} }`
              : '{}'
            arrow.replaceWithText(`${tagText}, { props: ${propsObj} }`)
            stats.renderCallsRewritten++
            continue
          }
        }
      }
      // If the lambda was marked as needing a fixture (e.g. JSX with
      // children), fall through to the fixture-extraction branch below
      // instead of emitting a TODO.
      if (!info.needsFixture) {
        // Couldn't simplify — leave it as a TODO comment around the render call
        const original = info.node.getText().replace(/\*\//g, '* /')
        info.node.replaceWithText(
          `/* TODO(svelte-port): render() lambda needs hand-translation */ ${original}`,
        )
        todos.push({
          location: `${basename(inputPath)}:${info.startLine}`,
          message: 'render(() => JSX) call: could not auto-translate to render(Component, { props })',
        })
        stats.todosEmitted++
        continue
      }
    }

    if (info.isTrivialMarkup) {
      // Replace `() => <X/>` with a snippet variable reference; emit declaration above.
      const arrow = info.node.asKind(SyntaxKind.ArrowFunction)
      if (!arrow) {
        // FunctionExpression with "trivial" markup but a name — treat as fixture
        info.needsFixture = true
        info.isTrivialMarkup = false
        info.reason = info.reason ?? 'named function expression — extract as fixture'
        // fall through to the needsFixture handler below
      }
    }

    if (info.isTrivialMarkup) {
      const arrow = info.node.asKind(SyntaxKind.ArrowFunction)!
      const body = arrow.getBody()
      let jsxText: string | null = null
      if (isJsxNode(body)) {
        jsxText = jsxToHtmlString(body)
      } else if (body.getKind() === SyntaxKind.ParenthesizedExpression) {
        const inner = body.getFirstDescendant(isJsxNode)
        if (inner) jsxText = jsxToHtmlString(inner)
      } else if (body.getKind() === SyntaxKind.Block) {
        // `() => { return (<JSX/>) }` — pull the single return expression.
        const block = body.asKind(SyntaxKind.Block)!
        const returns = block.getDescendantsOfKind(SyntaxKind.ReturnStatement)
        if (returns.length === 1) {
          const expr = returns[0]!.getExpression()
          if (expr) {
            if (isJsxNode(expr)) {
              jsxText = jsxToHtmlString(expr)
            } else if (expr.getKind() === SyntaxKind.ParenthesizedExpression) {
              const inner = expr.getFirstDescendant(isJsxNode)
              if (inner) jsxText = jsxToHtmlString(inner)
            }
          }
        }
      }
      if (!jsxText) {
        // Couldn't extract clean JSX — flag as TODO
        info.isUnhandled = true
        info.reason = info.reason ?? 'JSX shape too complex for snippet extraction'
      } else {
        const name = snippetNameFor(arrow.getText(), info.context, usedSnippetNames)
        // Use template literals — escape backticks and ${} sequences in JSX
        const escapedJsx = jsxText
          .replace(/\\/g, '\\\\')
          .replace(/`/g, '\\`')
          .replace(/\$\{/g, '\\${')
        snippetDeclarations.push(
          `const ${name} = createRawSnippet(() => ({\n  render: () => \`${escapedJsx}\`,\n}))`,
        )
        arrow.replaceWithText(name)
        stats.snippetsEmitted++
        needsCreateRawSnippet.value = true
        continue
      }
    }

    if (info.needsFixture) {
      // Extract to a .svelte fixture file
      const funcExp = info.node.asKind(SyntaxKind.FunctionExpression)
      const fixtureName = fixtureNameFor(
        funcExp?.getName(),
        info.context,
        usedFixtureNames,
      )

      let fixtureContent: string

      // Try a unified auto-translation that handles markup, custom components,
      // AND hook-using lambdas in one pass. We extract:
      //   - The JSX template body (from arrow expression body or function block return)
      //   - Hook variable declarations (`const x = useXxx(...)` or `const x = route.useXxx(...)`)
      //   - Required custom component imports
      // and emit working Svelte. The routeVar prefix on hook calls (e.g.,
      // `indexRoute.useNavigate()`) is dropped — the bare hook works for test
      // purposes; the `from` default is just less specific.
      const arrow = info.node.asKind(SyntaxKind.ArrowFunction)
      const fixtureFuncExp = info.node.asKind(SyntaxKind.FunctionExpression)
      const fnNode = arrow || fixtureFuncExp

      let templateBody: string | null = null
      const scriptLines: Array<string> = []
      const scriptDeclared = new Set<string>()
      // Partition customComponents: those that are real package exports →
      // imports from `../../../src`; those that aren't → closure-captured
      // (declared in script via `const X = _shared.X`).
      const fixtureImports = new Set<string>()
      // Imports from the `svelte` package (e.g. `onMount`) — separate from
      // `fixtureImports` which come from `../../../src`.
      const svelteImports = new Set<string>()
      // Sibling-fixture imports (e.g. `Fixture6` → `./Fixture6.svelte`).
      const siblingFixtureImports = new Set<string>()
      const closureComponents = new Set<string>()
      // Names declared via `createSignal` (Svelte translation: `let x = $state(...)`).
      // Their Solid-Accessor calls `x()` must become `x` (not `x.current`).
      const createSignalGetters = new Set<string>()
      // Names of `local` vars from `splitProps(props, [..., 'children', ...])`.
      // References to `<local>.children` in the template must use `@render`.
      const splitPropsChildrenLocals = new Set<string>()
      for (const tag of info.customComponents) {
        if (srcImports.has(tag)) {
          fixtureImports.add(tag)
        } else {
          closureComponents.add(tag)
        }
      }

      // If the lambda/function takes a `props` parameter (or destructured form
      // like `{ error, info }`), emit a `let X = $props()` declaration so the
      // body references resolve. This is the Svelte equivalent of receiving
      // props from the parent.
      const fnParams =
        info.node.asKind(SyntaxKind.ArrowFunction)?.getParameters() ??
        info.node.asKind(SyntaxKind.FunctionExpression)?.getParameters()
      if (fnParams && fnParams.length > 0) {
        const firstParam = fnParams[0]!
        const nameText = firstParam.getNameNode().getText()
        if (nameText) {
          scriptLines.push(`  let ${nameText}: any = $props()`)
          // Add any destructured names to scriptDeclared so they're not flagged
          // as free vars.
          const propNames = extractParamNames(nameText)
          for (const n of propNames) scriptDeclared.add(n)
          if (!nameText.startsWith('{')) scriptDeclared.add(nameText)
        }
      }

      // Get JSX body
      if (arrow) {
        templateBody = arrowJsxBodyText(arrow)
      } else if (fixtureFuncExp) {
        const fnBody = fixtureFuncExp.getBody()
        const returns = topLevelReturns(fnBody)
        if (returns.length === 1) {
          const expr = returns[0]!.asKind(SyntaxKind.ReturnStatement)!.getExpression()
          if (expr) {
            let t = expr.getText().trim()
            if (t.startsWith('(') && t.endsWith(')')) t = t.slice(1, -1).trim()
            if (t.startsWith('<>') && t.endsWith('</>')) t = t.slice(2, -3).trim()
            if (t.startsWith('<')) templateBody = t
          }
        }
      }

      // Walk function body for hook variable declarations AND bare hook calls
      const fnBody = fnNode?.asKind(SyntaxKind.ArrowFunction)?.getBody() ??
        fnNode?.asKind(SyntaxKind.FunctionExpression)?.getBody()
      const buildHookArgString = (call: Node): string => {
        // Resolve `routeVar.useXxx(...)` or `getRouteApi('/p').useXxx(...)`
        // to `useXxx({ from: '/p', ...args })` when statically possible.
        const ce = call.asKind(SyntaxKind.CallExpression)!
        const args = ce.getArguments().map((a) => a.getText())
        const calleeExpr = ce.getExpression()
        let resolvedFrom: string | null = null
        // Detect the hook name (the property accessor's right-hand side).
        const hookName =
          calleeExpr.getKind() === SyntaxKind.PropertyAccessExpression
            ? calleeExpr
                .asKind(SyntaxKind.PropertyAccessExpression)!
                .getNameNode()
                .getText()
            : null
        // For useNavigate the `from` is a URL path (pathless layouts skipped).
        // For other hooks like useRouteContext, the runtime expects a route
        // ID — emitting a URL path causes mis-matches. Restrict the pathless
        // layout fallback to useNavigate.
        const allowPathlessLayoutSkip = hookName === 'useNavigate'
        if (calleeExpr.getKind() === SyntaxKind.PropertyAccessExpression) {
          const pae = calleeExpr.asKind(SyntaxKind.PropertyAccessExpression)!
          const obj = pae.getExpression()
          if (obj.getKind() === SyntaxKind.Identifier) {
            const routeVarName = obj.getText()
            resolvedFrom = resolveRoutePath(
              routeVarName,
              sf as unknown as Node,
              info.node,
              { pathlessLayoutFallback: allowPathlessLayoutSkip },
            )
            if (resolvedFrom === null && allowPathlessLayoutSkip) {
              resolvedFrom = resolveRoutePathWithPathlessLayouts(
                routeVarName,
                sf as unknown as Node,
                info.node,
              )
            }
          } else if (obj.getKind() === SyntaxKind.CallExpression) {
            // `getRouteApi('/foo').useXxx(...)`
            const innerCall = obj.asKind(SyntaxKind.CallExpression)!
            const innerCallee = innerCall.getExpression().getText()
            if (innerCallee === 'getRouteApi') {
              const innerArgs = innerCall.getArguments()
              if (
                innerArgs.length > 0 &&
                innerArgs[0]!.getKind() === SyntaxKind.StringLiteral
              ) {
                const rawId = innerArgs[0]!
                  .asKind(SyntaxKind.StringLiteral)!
                  .getLiteralValue()
                if (allowPathlessLayoutSkip) {
                  // useNavigate `from:` is URL-path; strip pathless layout
                  // segments from the route ID.
                  resolvedFrom =
                    '/' +
                    rawId
                      .split('/')
                      .filter((seg) => seg && !seg.startsWith('_'))
                      .join('/')
                  if (resolvedFrom === '/') resolvedFrom = ''
                } else {
                  resolvedFrom = rawId
                }
              }
            }
          }
        }
        if (resolvedFrom !== null && resolvedFrom.length > 0) {
          const fromOpt = `from: '${resolvedFrom}'`
          if (args.length === 0) return `{ ${fromOpt} }`
          const firstArg = ce.getArguments()[0]
          if (firstArg?.getKind() === SyntaxKind.ObjectLiteralExpression) {
            const t = firstArg.getText()
            if (/\bfrom\s*:/.test(t)) return args.join(', ')
            if (t === '{}') {
              return `{ ${fromOpt} }${args.length > 1 ? ', ' + args.slice(1).join(', ') : ''}`
            }
            const merged = '{ ' + fromOpt + ', ' + t.slice(1, -1).trim() + ' }'
            return [merged, ...args.slice(1)].join(', ')
          }
          return [`{ ${fromOpt} }`, ...args].join(', ')
        }
        return args.join(', ')
      }
      if (fnBody?.getKind() === SyntaxKind.Block) {
        const block = fnBody.asKind(SyntaxKind.Block)!
        // Process top-level statements in source order. Local consts that
        // reference hook results (e.g. `const m = matchRoute({to: path})`)
        // need to live in the fixture script too.
        block.getStatements().forEach((stmt) => {
          if (stmt.getKind() === SyntaxKind.ReturnStatement) return
          if (stmt.getKind() === SyntaxKind.VariableStatement) {
            const vs = stmt.asKind(SyntaxKind.VariableStatement)!
            const list = vs.getDeclarationList()
            const kindMatch = list.getText().match(/^(const|let|var)\b/)
            const kind = kindMatch?.[1] ?? 'const'
            vs.getDeclarations().forEach((vd) => {
              const init = vd.getInitializer()
              const varName = vd.getNameNode().getText()
              // Destructure: `const [x, setX] = Solid.createSignal(init)` →
              // Svelte `$state` + setter wrapper.
              if (varName.startsWith('[')) {
                if (init && init.getKind() === SyntaxKind.CallExpression) {
                  const call = init.asKind(SyntaxKind.CallExpression)!
                  const calleeText = call.getExpression().getText()
                  const finalName = calleeText.split('.').pop() ?? calleeText
                  // User-defined helper hook (e.g. `const useFoo = (name) => {...; return [a,b] as const}`)
                  // called destructured: `const [X, Y] = useFoo('test')`. Inline the body.
                  const inlined = tryInlineUserHook({
                    callee: calleeText,
                    args: call.getArguments(),
                    destructured: varName,
                    sf: sf as unknown as Node,
                    info,
                    scriptLines,
                    scriptDeclared,
                    fixtureImports,
                    sharedVars,
                    closureCaptured,
                    closureComponents,
                  })
                  if (inlined) return
                  if (finalName === 'createSignal') {
                    const m = varName.match(
                      /^\[\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\]$/,
                    )
                    if (m) {
                      const [, getter, setter] = m
                      const args = call.getArguments().map((a) => a.getText()).join(', ')
                      scriptLines.push(`  let ${getter} = $state(${args})`)
                      scriptLines.push(
                        `  function ${setter}(v: any) { ${getter} = typeof v === 'function' ? v(${getter}) : v }`,
                      )
                      scriptDeclared.add(getter!)
                      scriptDeclared.add(setter!)
                      // Track for `getter()` → `getter` rewriting later
                      createSignalGetters.add(getter!)
                      return
                    }
                  }
                  // `const [local, rest] = Solid.splitProps(props, ['a', 'b'])`
                  // → emit `local`/`rest` as `$derived` objects partitioning
                  // the props bag. Keys come from the 2nd arg array literal.
                  if (finalName === 'splitProps') {
                    const m = varName.match(
                      /^\[\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\]$/,
                    )
                    const args = call.getArguments()
                    if (
                      m &&
                      args.length >= 2 &&
                      args[1]!.getKind() === SyntaxKind.ArrayLiteralExpression
                    ) {
                      const [, localName, restName] = m
                      const sourceText = args[0]!.getText()
                      const keyLiterals = args[1]!
                        .asKind(SyntaxKind.ArrayLiteralExpression)!
                        .getElements()
                        .filter((e) => e.getKind() === SyntaxKind.StringLiteral)
                        .map((e) =>
                          e.asKind(SyntaxKind.StringLiteral)!.getLiteralValue(),
                        )
                      const keysJson = JSON.stringify(keyLiterals)
                      scriptLines.push(
                        `  const ${localName} = $derived(Object.fromEntries(${keysJson}.map((k) => [k, (${sourceText} as any)[k]])))`,
                      )
                      scriptLines.push(
                        `  const ${restName} = $derived(Object.fromEntries(Object.entries(${sourceText} as any).filter(([k]) => !${keysJson}.includes(k))))`,
                      )
                      scriptDeclared.add(localName!)
                      scriptDeclared.add(restName!)
                      // If `children` is among the picked keys, the local
                      // accessor `local.children` refers to the Svelte
                      // children snippet — references in the template need
                      // `@render local.children()` instead of bare interp.
                      if (keyLiterals.includes('children')) {
                        splitPropsChildrenLocals.add(localName!)
                      }
                      return
                    }
                  }
                }
                return
              }
              if (varName.startsWith('{')) return
              if (init && init.getKind() === SyntaxKind.CallExpression) {
                const call = init.asKind(SyntaxKind.CallExpression)!
                const calleeText = call.getExpression().getText()
                const finalName = calleeText.split('.').pop() ?? calleeText
                // Solid `useContext(key)` → Svelte `getContext(key)`.
                if (finalName === 'useContext') {
                  const args = call
                    .getArguments()
                    .map((a) => a.getText())
                    .join(', ')
                  scriptLines.push(
                    `  ${kind} ${varName} = getContext(${args})`,
                  )
                  svelteImports.add('getContext')
                  scriptDeclared.add(varName)
                  return
                }
                if (KNOWN_HOOKS.has(finalName)) {
                  const argStr = buildHookArgString(call)
                  scriptLines.push(
                    `  ${kind} ${varName} = ${finalName}(${argStr})`,
                  )
                  fixtureImports.add(finalName)
                  scriptDeclared.add(varName)
                  return
                }
              }
              // Non-hook local declaration — emit if its initializer
              // references at least one identifier already declared in the
              // script (i.e. it derives from a hook result), OR if RHS is a
              // bare PascalCase identifier (likely a sibling fixture component
              // from Pattern C extraction), OR if the var itself is a JSX tag
              // used in the template (then we keep the *local* declaration
              // and let closure-capture rewrite any free idents in the RHS).
              const initText = init?.getText() ?? ''
              const refsScriptVar = [...scriptDeclared].some(
                (n) =>
                  new RegExp(`\\b${n}\\b`).test(initText),
              )
              const isComponentAlias =
                /^[A-Z][\w$]*$/.test(initText.trim()) &&
                /^[A-Z]/.test(varName)
              const isUsedJsxTag = closureComponents.has(varName)
              if (
                init &&
                (refsScriptVar || isComponentAlias || isUsedJsxTag)
              ) {
                if (isComponentAlias) {
                  const aliasName = initText.trim()
                  // Sibling fixture (e.g. `Fixture6`) → import from
                  // `./FixtureN.svelte`. Router-exported components (rare in
                  // this position) keep going through `fixtureImports`.
                  if (/^Fixture\d+$/.test(aliasName)) {
                    siblingFixtureImports.add(aliasName)
                  } else {
                    fixtureImports.add(aliasName)
                  }
                }
                if (isUsedJsxTag) {
                  // Keep this as a LOCAL declaration — don't auto-emit a
                  // `const X = _shared.X` shim later.
                  closureComponents.delete(varName)
                }
                scriptLines.push(`  ${kind} ${varName} = ${initText}`)
                scriptDeclared.add(varName)
              }
            })
            return
          }
          if (stmt.getKind() === SyntaxKind.ExpressionStatement) {
            const es = stmt.asKind(SyntaxKind.ExpressionStatement)!
            const expr = es.getExpression()
            if (expr.getKind() === SyntaxKind.CallExpression) {
              const call = expr.asKind(SyntaxKind.CallExpression)!
              const calleeText = call.getExpression().getText()
              const finalName = calleeText.split('.').pop() ?? calleeText
              // Solid primitives → Svelte equivalents. BUT: if `onMount`
              // is the name of a parameter on an enclosing function, this is
              // a closure-captured callback (not Solid's onMount). Emit the
              // call as a normal statement and let closure-capture rewrite
              // it to `_shared.onMount(...)`.
              const onMountIsShadowed = (() => {
                if (finalName !== 'onMount') return false
                let cur: Node | undefined = info.node
                while (cur) {
                  cur = cur.getParent()
                  if (!cur) break
                  const k = cur.getKind()
                  const fn =
                    k === SyntaxKind.FunctionDeclaration
                      ? cur.asKind(SyntaxKind.FunctionDeclaration)!
                      : k === SyntaxKind.FunctionExpression
                        ? cur.asKind(SyntaxKind.FunctionExpression)!
                        : k === SyntaxKind.ArrowFunction
                          ? cur.asKind(SyntaxKind.ArrowFunction)!
                          : k === SyntaxKind.MethodDeclaration
                            ? cur.asKind(SyntaxKind.MethodDeclaration)!
                            : null
                  if (!fn) continue
                  for (const p of fn.getParameters()) {
                    const pn = p.getNameNode()
                    if (
                      pn.getKind() === SyntaxKind.Identifier &&
                      pn.getText() === 'onMount'
                    ) {
                      return true
                    }
                  }
                }
                return false
              })()
              if (finalName === 'onMount' && !onMountIsShadowed) {
                const args = call.getArguments().map((a) => a.getText()).join(', ')
                scriptLines.push(`  onMount(${args})`)
                scriptDeclared.add('onMount')
                // onMount imported from 'svelte', not '../../../src'
                svelteImports.add('onMount')
                return
              }
              if (finalName === 'createEffect') {
                const args = call.getArguments().map((a) => a.getText()).join(', ')
                scriptLines.push(`  $effect(() => { (${args})() })`)
                return
              }
              if (KNOWN_HOOKS.has(finalName)) {
                const argStr = buildHookArgString(call)
                scriptLines.push(`  ${finalName}(${argStr})`)
                fixtureImports.add(finalName)
                return
              }
            }
            // Generic side-effect statement (e.g. `errorSpy = error`).
            // Skip `expect(...)` calls — these are test-time assertions that
            // belong in the test body, not the fixture script.
            const exprText = expr.getText()
            if (/^\s*expect\s*\(/.test(exprText)) return
            scriptLines.push(`  ${exprText}`)
          }
        })
      }

      if (templateBody !== null) {
        // Lift inline hook calls from the template to the script.
        // Pattern: `routeVar.useXxx(args)` or `routeVar.useXxx(args)()` (Solid
        // Accessor call) found inside `{...}` expressions. We replace with a
        // generated variable name and emit `const X = useXxx({ from: '/path' })`
        // in the script. The route path is resolved via `resolveRoutePath`.
        {
          let liftCounter = 0
          const liftedHookPattern = /\b([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*?)\.(use[A-Z][\w$]*)\s*\(([^)]*)\)(\s*\(\s*\))?/g
          templateBody = templateBody.replace(
            liftedHookPattern,
            (_match, qualPath, hookName, hookArgs, secondCall) => {
              const routeVar = qualPath.split('.')[0]!
              const path = resolveRoutePath(
                routeVar,
                sf as unknown as Node,
                info.node,
              )
              const liftedName = `${hookName.replace(/^use/, '').toLowerCase()}Lifted${liftCounter++}`
              let argStr: string
              if (path !== null && path.length > 0) {
                const fromOpt = `from: '${path}'`
                if (!hookArgs.trim()) {
                  argStr = `{ ${fromOpt} }`
                } else if (hookArgs.trim().startsWith('{') && hookArgs.trim().endsWith('}')) {
                  const t = hookArgs.trim()
                  if (/\bfrom\s*:/.test(t)) argStr = t
                  else if (t === '{}') argStr = `{ ${fromOpt} }`
                  else argStr = '{ ' + fromOpt + ', ' + t.slice(1, -1).trim() + ' }'
                } else {
                  argStr = `{ ${fromOpt} }, ${hookArgs}`
                }
              } else {
                argStr = hookArgs
              }
              scriptLines.push(`  const ${liftedName} = ${hookName}(${argStr})`)
              fixtureImports.add(hookName)
              scriptDeclared.add(liftedName)
              // Returns `.current` since hooks return `{ current }`. If the
              // original had a second-call `()` it was Solid's Accessor invocation;
              // either way we use `.current`.
              return `${liftedName}.current`
            },
          )
        }

        // ----- Solid `<ctxVar.Provider value={V}>{children}</ctxVar.Provider>`
        // → Svelte `setContext(ctxVar, V)` in script + render children. We do
        // this BEFORE `jsxToSvelteTemplate` strips the dotted prefix.
        templateBody = templateBody.replace(
          /<([A-Za-z_$][\w$]*)\.Provider\b([^>]*?)>([\s\S]*?)<\/\1\.Provider>/g,
          (_m, ctxVar, attrs, inner) => {
            // Pull `value={...}` (or `value="..."`) out of the attrs string.
            const valMatch = attrs.match(
              /\bvalue\s*=\s*(?:\{([\s\S]*?)\}|"([^"]*)"|'([^']*)')/,
            )
            const valExpr = valMatch
              ? valMatch[1] ?? JSON.stringify(valMatch[2] ?? valMatch[3] ?? '')
              : 'undefined'
            scriptLines.push(`  setContext(${ctxVar}, ${valExpr})`)
            svelteImports.add('setContext')
            return inner
          },
        )

        // ----- Solid `<ErrorBoundary fallback={(err) => <JSX/>}>{children}</ErrorBoundary>`
        // → Svelte `<svelte:boundary>...{#snippet failed(err)}<JSX/>{/snippet}</svelte:boundary>`.
        // Brace-aware scanner since the attrs may themselves contain `>` (JSX).
        const beforeBoundary = templateBody
        templateBody = rewriteErrorBoundaryToSvelteBoundary(templateBody, info)
        if (beforeBoundary !== templateBody) {
          // Drop the now-unused `const ErrorBoundary = _shared.ErrorBoundary`
          // line that was pre-emitted for the closure component.
          for (let li = scriptLines.length - 1; li >= 0; li--) {
            if (/\bconst\s+ErrorBoundary\s*=/.test(scriptLines[li]!)) {
              scriptLines.splice(li, 1)
            }
          }
          closureComponents.delete('ErrorBoundary')
          scriptDeclared.delete('ErrorBoundary')
        }

        resetDottedAliases()
        let template = jsxToSvelteTemplate(templateBody)
        // Translate event handlers: onClick → onclick, onChange → onchange, etc.
        template = template.replace(
          /(\s)on([A-Z][a-zA-Z]*)=/g,
          (_, ws, name) => `${ws}on${name.toLowerCase()}=`,
        )

        // Emit hoisted aliases for dotted JSX tags collected during the
        // jsxToSvelteTemplate pass: `<routeVar.Link>` produces an alias
        // `RouteVarLink` plus a script-level `const RouteVarLink = routeVar.Link`.
        // The `routeVar` itself becomes a free var and is routed through
        // `_shared` (or `srcImports`) by the closure-capture pass below.
        for (const { alias, expr } of drainDottedAliases()) {
          if (scriptDeclared.has(alias)) continue
          scriptLines.push(`  const ${alias} = ${expr}`)
          scriptDeclared.add(alias)
        }
        // splitProps `local.children` references in the template must invoke
        // the Svelte snippet — rewrite `{local.children}` to render it.
        for (const localName of splitPropsChildrenLocals) {
          const re = new RegExp(`\\{\\s*${localName}\\.children\\s*\\}`, 'g')
          template = template.replace(
            re,
            `{#if ${localName}.children}{@render ${localName}.children()}{/if}`,
          )
        }
        // `{props.children}` (and `{<paramName>.children}`) in the template:
        // Solid renders the children element directly; Svelte 5 requires
        // `{@render snippet()}`. Rewrite the bare interp to a guarded render.
        const propBindingNames = new Set<string>(['props'])
        // Detect `let X: any = $props()` lines in the script and treat X as a
        // props binding too.
        for (const line of scriptLines) {
          const m = line.match(/let\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*\$props\(\)/)
          if (m) propBindingNames.add(m[1]!)
        }
        for (const pname of propBindingNames) {
          const re = new RegExp(`\\{\\s*${pname}\\.children\\s*\\}`, 'g')
          template = template.replace(
            re,
            `{#if ${pname}.children}{@render ${pname}.children()}{/if}`,
          )
        }
        // Translate Solid Accessor call sites: `xxx()` → `xxx.current` for any
        // variable we tracked above (template AND remaining script lines).
        const trackedVars = new Set<string>()
        // Vars whose accessor calls should be rewritten (NOT navigate/router/etc).
        const rewriteCallable = new Set<string>()
        for (const line of scriptLines) {
          const match = line.match(/(?:const|let|var)\s+(\w+)\s*=\s*(\w+)\(/)
          if (!match) continue
          const [, varName, hookName] = match
          trackedVars.add(varName)
          if (
            hookName !== 'useNavigate' &&
            hookName !== 'useRouter' &&
            hookName !== 'useMatchRoute' &&
            hookName !== 'useBlocker'
          ) {
            rewriteCallable.add(varName)
          }
        }
        // Track alias declarations like `const X = Y` where Y is already a
        // tracked accessor — `X()` becomes `X.current` too.
        for (const line of scriptLines) {
          const aliasMatch = line.match(
            /(?:const|let|var)\s+(\w+)\s*=\s*(\w+)\s*$/,
          )
          if (!aliasMatch) continue
          const [, aliasName, srcName] = aliasMatch
          if (rewriteCallable.has(srcName!)) {
            rewriteCallable.add(aliasName!)
            trackedVars.add(aliasName!)
          }
        }
        for (const varName of rewriteCallable) {
          const re = new RegExp(`\\b${varName}\\(\\)`, 'g')
          template = template.replace(re, `${varName}.current`)
          for (let i = 0; i < scriptLines.length; i++) {
            scriptLines[i] = scriptLines[i]!.replace(re, `${varName}.current`)
          }
        }
        // createSignal getters: `getter()` → `getter` (Svelte $state is a plain
        // value, not a function/accessor).
        for (const getter of createSignalGetters) {
          const re = new RegExp(`\\b${getter}\\(\\)`, 'g')
          template = template.replace(re, getter)
          for (let i = 0; i < scriptLines.length; i++) {
            scriptLines[i] = scriptLines[i]!.replace(re, getter)
          }
        }

        // For closure components (PascalCase tags not exported from src),
        // emit a const binding to the shared slot so the local tag resolves.
        // Skip any tag that was already declared by the body-extraction pass.
        let didDeclareClosureComponent = false
        for (const tag of closureComponents) {
          if (scriptDeclared.has(tag)) continue
          scriptLines.push(`  const ${tag} = _shared.${tag}`)
          scriptDeclared.add(tag)
          sharedVars.set(tag, 'any')
          closureCaptured.add(tag)
          didDeclareClosureComponent = true
        }
        if (didDeclareClosureComponent) {
          fixtureImports.add('__USE_SHARED__')
        }

        // ----- Pattern A: closure capture → _shared module -----
        // Collect "declared" identifiers within the fixture: hook vars, imports,
        // standard local names. Any identifier not in this set is "free" — it
        // was captured from the enclosing test scope and must be routed through
        // the per-file shared module.
        const declared = new Set<string>([
          ...fixtureImports,
          ...scriptDeclared,
          ...trackedVars,
          ...info.customComponents,
          ...svelteImports,
          'props',
          '_shared',
        ])
        // Add identifiers introduced as lambda parameters inside template/script.
        // They're in scope (not closure-captured) and must not be rewritten.
        for (const n of findLambdaParamNames(template)) declared.add(n)
        for (const line of scriptLines) {
          for (const n of findLambdaParamNames(line)) declared.add(n)
        }
        const freeVars = findFreeVarsInTemplate(template, declared)
        // Also check scriptLines for free vars (e.g. hook args)
        for (const line of scriptLines) {
          for (const id of scanFreeIdents(line, declared)) freeVars.add(id)
        }
        if (freeVars.size > 0) {
          // Names of fixtures we've already emitted from this file — for
          // recognising sibling-fixture references during free-var rewrites.
          const knownFixtures = new Set(
            fixtures.map((f) => f.name.replace(/\.svelte$/, '')),
          )
          let usedShared = false
          for (const v of freeVars) {
            if (srcImports.has(v)) {
              // The router package exports this name — just import it directly.
              fixtureImports.add(v)
              continue
            }
            if (knownFixtures.has(v) || /^Fixture\d+$/.test(v)) {
              // Sibling fixture component — emit a direct import.
              siblingFixtureImports.add(v)
              continue
            }
            // Real closure capture: route through `_shared`.
            template = rewriteTemplateIdent(template, v, `_shared.${v}`)
            for (let i = 0; i < scriptLines.length; i++) {
              scriptLines[i] = rewriteJsIdent(scriptLines[i]!, v, `_shared.${v}`)
            }
            sharedVars.set(v, 'any')
            closureCaptured.add(v)
            usedShared = true
          }
          if (usedShared) {
            fixtureImports.add('__USE_SHARED__')
          }
        }

        const importList = [...fixtureImports]
          .filter((n) => n !== '__USE_SHARED__')
          .sort()
          .join(', ')
        const svelteImportList = [...svelteImports].sort().join(', ')
        const usesShared = fixtureImports.has('__USE_SHARED__')
        const siblingImports = [...siblingFixtureImports]
          .sort()
          .map((n) => `  import ${n} from './${n}.svelte'\n`)
          .join('')
        const scriptBody =
          (svelteImportList
            ? `\n  import { ${svelteImportList} } from 'svelte'\n`
            : '\n') +
          (importList
            ? `  import { ${importList} } from '../../../../src'\n`
            : '') +
          siblingImports +
          (usesShared
            ? `  import { _shared } from '../shared.svelte'\n`
            : '') +
          (scriptLines.length ? scriptLines.join('\n') + '\n' : '')
        fixtureContent = `<script lang="ts">${scriptBody}</script>

${template}
`
        fixtures.push({ name: `${fixtureName}.svelte`, content: fixtureContent })
        info.node.replaceWithText(fixtureName)
        stats.fixturesEmitted++
        continue
      }

      // Fall through: TODO stub for cases we couldn't auto-translate.
      const lambdaText = info.node.getText()
      fixtureContent = `<script lang="ts">
  // TODO(svelte-port): translate the following ${info.reason ?? 'lambda'} into Svelte:
  // ${lambdaText.replace(/\n/g, '\n  // ')}
</script>

<!-- TODO(svelte-port): render this fixture -->
`
      fixtures.push({ name: `${fixtureName}.svelte`, content: fixtureContent })
      info.node.replaceWithText(fixtureName)
      todos.push({
        location: `${basename(inputPath)}:${info.startLine}`,
        message: `Fixture extracted to fixtures/${fixtureName}.svelte (${info.reason ?? 'complex lambda'}) — needs hand-translation`,
      })
      stats.fixturesEmitted++
      stats.todosEmitted++
      continue
    }

    if (info.isUnhandled) {
      // Wrap in /* TODO */ comment so the developer sees it inline
      const original = info.node.getText().replace(/\*\//g, '* /')
      info.node.replaceWithText(
        `/* TODO(svelte-port): ${info.reason ?? 'unhandled'} */ (${original})`,
      )
      todos.push({
        location: `${basename(inputPath)}:${info.startLine}`,
        message: info.reason ?? 'unhandled JSX lambda',
      })
      stats.todosEmitted++
    }
  }

  // ----- Hoist Pattern C var-bindings to the top of their owning block -----
  // The original `function X() {...}` was hoisted; after our refactor it is
  // `var X = SomeFixture` at the original position. Use sites that appear
  // BEFORE that position in source would see X as undefined. Hoist the
  // `var X = SomeFixture;` statement to the top of the enclosing block so its
  // assignment (not just the declaration) is visible everywhere.
  if (funcDeclHoistInfos.length > 0) {
    for (const { name, ownerBlock } of funcDeclHoistInfos) {
      // Find the matching `var <name> = ...` VariableStatement inside owner.
      const matchingVs = ownerBlock
        .getDescendantsOfKind(SyntaxKind.VariableStatement)
        .find((vs) => {
          const list = vs.getDeclarationList()
          const kindMatch = list.getText().match(/^(const|let|var)\b/)
          if (kindMatch?.[1] !== 'var') return false
          return list
            .getDeclarations()
            .some((vd) => vd.getNameNode().getText() === name)
        })
      if (!matchingVs) continue
      const stmtText = matchingVs.getText()
      // Remove from current position
      matchingVs.remove()
      // Insert at the top of the owner block
      if (ownerBlock.getKind() === SyntaxKind.Block) {
        const blockNode = ownerBlock.asKind(SyntaxKind.Block)!
        blockNode.insertStatements(0, stmtText)
      } else if (ownerBlock.getKind() === SyntaxKind.SourceFile) {
        ;(ownerBlock as any).insertStatements(0, stmtText)
      }
    }
  }

  // ----- Pattern A wiring: rewrite test-file declarations for closure-captured vars -----
  // For each fixture-extracted free var, find its declaration in the test file
  // and rewrite so that the var lives on the `_shared` module. This makes the
  // test code and the fixture share a single mutable storage location.
  if (closureCaptured.size > 0) {
    // Collect descendant VariableDeclaration / Parameter nodes.
    const declMatches: Array<{
      kind: 'let-decl' | 'const-decl' | 'var-decl' | 'param'
      varName: string
      node: Node
    }> = []
    sf.getDescendantsOfKind(SyntaxKind.VariableDeclaration).forEach((vd) => {
      const name = vd.getNameNode().getText()
      if (!closureCaptured.has(name)) return
      const vsParent = vd.getFirstAncestorByKind(SyntaxKind.VariableStatement)
      if (!vsParent) return
      const kindText = vsParent
        .getFirstChildByKind(SyntaxKind.VariableDeclarationList)
        ?.getFirstChild()
        ?.getText()
      const kind = kindText === 'let' ? 'let-decl' : kindText === 'var' ? 'var-decl' : 'const-decl'
      declMatches.push({ kind, varName: name, node: vd })
    })
    sf.getDescendantsOfKind(SyntaxKind.Parameter).forEach((p) => {
      const nameNode = p.getNameNode()
      // Simple param: name is Identifier
      if (nameNode.getKind() === SyntaxKind.Identifier) {
        const name = nameNode.getText()
        if (closureCaptured.has(name)) {
          declMatches.push({ kind: 'param', varName: name, node: p })
        }
      } else if (nameNode.getKind() === SyntaxKind.ObjectBindingPattern) {
        const obp = nameNode.asKind(SyntaxKind.ObjectBindingPattern)!
        obp.getElements().forEach((el) => {
          const elName = el.getNameNode().getText()
          if (closureCaptured.has(elName)) {
            declMatches.push({ kind: 'param', varName: elName, node: p })
          }
        })
      }
    })

    // 1. For each `let`/`var`/`const` declaration of a captured var, replace
    //    the parent VariableStatement with `;_shared.X = init`.
    //    Also rewrite all Identifier references in scope to `_shared.X`.
    const handledVarStatements = new Set<Node>()
    const renameRefs = new Map<string, Array<Node>>()

    // Group decls by VariableStatement so we handle multi-decl statements correctly
    const vsByDecls = new Map<Node, Array<{ varName: string; vd: Node }>>()
    for (const m of declMatches) {
      if (m.kind === 'param') continue
      const vs = m.node.getFirstAncestorByKind(SyntaxKind.VariableStatement)!
      if (!vsByDecls.has(vs)) vsByDecls.set(vs, [])
      vsByDecls.get(vs)!.push({ varName: m.varName, vd: m.node })
    }

    // Rewrite param-based ones: inject `_shared.X = X` at top of function body
    const paramInjections = new Map<Node, Array<string>>()
    for (const m of declMatches) {
      if (m.kind !== 'param') continue
      // Find enclosing function
      const owner =
        m.node.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration) ||
        m.node.getFirstAncestorByKind(SyntaxKind.FunctionExpression) ||
        m.node.getFirstAncestorByKind(SyntaxKind.ArrowFunction) ||
        m.node.getFirstAncestorByKind(SyntaxKind.MethodDeclaration)
      if (!owner) continue
      const bodyNode =
        owner.asKind(SyntaxKind.ArrowFunction)?.getBody() ??
        owner.asKind(SyntaxKind.FunctionDeclaration)?.getBody() ??
        owner.asKind(SyntaxKind.FunctionExpression)?.getBody() ??
        owner.asKind(SyntaxKind.MethodDeclaration)?.getBody()
      if (!bodyNode || bodyNode.getKind() !== SyntaxKind.Block) continue
      if (!paramInjections.has(bodyNode)) paramInjections.set(bodyNode, [])
      const arr = paramInjections.get(bodyNode)!
      if (!arr.includes(m.varName)) arr.push(m.varName)
    }

    // Collect references to closure-captured vars in test file (for renames)
    sf.getDescendantsOfKind(SyntaxKind.Identifier).forEach((id) => {
      const name = id.getText()
      if (!closureCaptured.has(name)) return
      // Skip the declaration itself
      const parent = id.getParent()
      if (!parent) return
      const pk = parent.getKind()
      // Skip declarations:
      if (pk === SyntaxKind.VariableDeclaration) {
        const vd = parent.asKind(SyntaxKind.VariableDeclaration)!
        if (vd.getNameNode() === id) return
      }
      if (pk === SyntaxKind.Parameter) {
        const p = parent.asKind(SyntaxKind.Parameter)!
        if (p.getNameNode() === id) return
      }
      if (pk === SyntaxKind.BindingElement) {
        // Inside `{ X }` destructuring — skip
        return
      }
      // Skip property names: `{ X: ... }` or `obj.X`
      if (pk === SyntaxKind.PropertyAssignment) {
        const pa = parent.asKind(SyntaxKind.PropertyAssignment)!
        if (pa.getNameNode() === id) return
      }
      if (pk === SyntaxKind.ShorthandPropertyAssignment) {
        // `{ X }` in object literal — rewrite the whole shorthand to
        // `{ X: _shared.X }` so the returned object actually carries the
        // captured value (not the now-undefined local).
        const sp = parent.asKind(SyntaxKind.ShorthandPropertyAssignment)!
        if (sp.getNameNode() === id) {
          if (!renameRefs.has('__shorthand:' + name)) {
            renameRefs.set('__shorthand:' + name, [])
          }
          renameRefs.get('__shorthand:' + name)!.push(sp)
        }
        return
      }
      if (pk === SyntaxKind.PropertyAccessExpression) {
        const pae = parent.asKind(SyntaxKind.PropertyAccessExpression)!
        if (pae.getNameNode() === id) return
      }
      if (pk === SyntaxKind.ImportSpecifier) return
      if (pk === SyntaxKind.NamedImports) return
      // Skip interface/type property declarations
      if (
        pk === SyntaxKind.PropertySignature ||
        pk === SyntaxKind.MethodSignature ||
        pk === SyntaxKind.IndexSignature
      ) {
        return
      }
      // Skip type annotations: TypeReference and friends
      if (
        pk === SyntaxKind.TypeReference ||
        pk === SyntaxKind.QualifiedName ||
        pk === SyntaxKind.IndexedAccessType
      ) {
        return
      }
      // Skip JSX attribute names: identifier as attribute name on left of `=`
      if (pk === SyntaxKind.JsxAttribute) {
        const jsxA = parent.asKind(SyntaxKind.JsxAttribute)!
        if (jsxA.getNameNode() === id) return
      }
      // Only rewrite refs that aren't in a function whose param is this name
      // (we keep the param in scope so non-rewritten refs inside the fn still
      // resolve to it). For `let`/`const`/`var` declared inside that fn, the
      // declaration gets rewritten too — so refs always resolve to _shared.X.
      const inOwnerFn = id.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration) ||
        id.getFirstAncestorByKind(SyntaxKind.FunctionExpression) ||
        id.getFirstAncestorByKind(SyntaxKind.ArrowFunction) ||
        id.getFirstAncestorByKind(SyntaxKind.MethodDeclaration)
      let inParamScope = false
      if (inOwnerFn) {
        const owner = inOwnerFn
        const ownerParams =
          owner.asKind(SyntaxKind.ArrowFunction)?.getParameters() ??
          owner.asKind(SyntaxKind.FunctionDeclaration)?.getParameters() ??
          owner.asKind(SyntaxKind.FunctionExpression)?.getParameters() ??
          owner.asKind(SyntaxKind.MethodDeclaration)?.getParameters()
        for (const pp of ownerParams ?? []) {
          const pn = pp.getNameNode()
          if (pn.getKind() === SyntaxKind.Identifier && pn.getText() === name) {
            inParamScope = true
            break
          }
          if (pn.getKind() === SyntaxKind.ObjectBindingPattern) {
            const obp = pn.asKind(SyntaxKind.ObjectBindingPattern)!
            for (const el of obp.getElements()) {
              if (el.getNameNode().getText() === name) {
                inParamScope = true
                break
              }
            }
          }
        }
      }
      if (inParamScope) return
      if (!renameRefs.has(name)) renameRefs.set(name, [])
      renameRefs.get(name)!.push(id)
    })

    // Apply rewrites in descending offset order to avoid invalidating positions
    const allEdits: Array<{ start: number; end: number; replacement: string }> = []
    const vsRanges: Array<[number, number]> = []
    const rewriteCapturedIdents = (text: string): string => {
      let v = text
      for (const captured of closureCaptured) {
        v = rewriteJsIdent(v, captured, `_shared.${captured}`)
      }
      return v
    }
    for (const [vs, decls] of vsByDecls) {
      const start = vs.getStart()
      const end = vs.getEnd()
      vsRanges.push([start, end])
      // Build the replacement: `;_shared.X = init; _shared.Y = init2;`
      const stmts: Array<string> = []
      const vsNode = vs.asKind(SyntaxKind.VariableStatement)!
      const declList = vsNode.getDeclarationList()
      for (const vd of declList.getDeclarations()) {
        const name = vd.getNameNode().getText()
        const init = vd.getInitializer()
        if (!closureCaptured.has(name)) {
          // Not captured — keep as-is via re-emit, but rewrite inner captures
          const initText = init ? ' = ' + rewriteCapturedIdents(init.getText()) : ''
          const listKindMatch = declList.getText().match(/^(const|let|var)\b/)
          const listKind = listKindMatch?.[1] ?? 'const'
          stmts.push(`${listKind} ${name}${initText}`)
        } else {
          const v = init ? rewriteCapturedIdents(init.getText()) : 'undefined'
          stmts.push(`_shared.${name} = ${v}`)
        }
      }
      allEdits.push({ start, end, replacement: stmts.join('; ') + ';' })
    }
    // Drop rename edits whose position falls inside any VS rewrite range —
    // the VS rewrite already includes (and itself rewrites) those references.
    const insideVsRange = (pos: number) =>
      vsRanges.some(([s, e]) => pos >= s && pos < e)
    for (const [key, ids] of renameRefs) {
      const isShorthand = key.startsWith('__shorthand:')
      const shorthandName = isShorthand ? key.slice('__shorthand:'.length) : ''
      for (const id of ids) {
        if (insideVsRange(id.getStart())) continue
        if (isShorthand) {
          allEdits.push({
            start: id.getStart(),
            end: id.getEnd(),
            replacement: `${shorthandName}: _shared.${shorthandName}`,
          })
        } else {
          allEdits.push({
            start: id.getStart(),
            end: id.getEnd(),
            replacement: `_shared.${id.getText()}`,
          })
        }
      }
    }
    // Param injections: insert at the start of the block (just after `{`)
    for (const [block, names] of paramInjections) {
      const blockNode = block.asKind(SyntaxKind.Block)!
      const openBrace = blockNode.getFirstChildByKind(SyntaxKind.OpenBraceToken)
      const insertAt = openBrace ? openBrace.getEnd() : blockNode.getStart() + 1
      if (insideVsRange(insertAt)) continue
      const assigns = names.map((n) => `_shared.${n} = ${n}`).join('; ')
      allEdits.push({
        start: insertAt,
        end: insertAt,
        replacement: `\n  ${assigns};`,
      })
    }
    // Sort descending and apply
    allEdits.sort((a, b) => b.start - a.start || b.end - a.end)
    let fullText = sf.getFullText()
    for (const e of allEdits) {
      fullText = fullText.slice(0, e.start) + e.replacement + fullText.slice(e.end)
    }
    sf.replaceWithText(fullText)
  }

  // ----- Step 2.4: Translate `vi.fn().mockReturnValue(<JSX/>)` -----
  // Solid pattern: `const X = vi.fn().mockReturnValue(<JSX/>)` — `X` is a
  // function returning JSX, usable both as a component and a spy.
  // Svelte: extract the JSX as a fixture and wrap with `vi.fn(Fixture)`.
  {
    const candidates: Array<{ call: Node; jsxArg: Node }> = []
    sf.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
      const calleeText = call.getExpression().getText()
      if (!/\bmockReturnValue$/.test(calleeText)) return
      const args = call.getArguments()
      if (args.length !== 1) return
      const arg = args[0]!
      if (!isJsxNode(arg)) return
      candidates.push({ call, jsxArg: arg })
    })
    candidates.sort((a, b) => b.call.getStart() - a.call.getStart())
    for (const { call, jsxArg } of candidates) {
      const fixtureName = fixtureNameFor(
        undefined,
        'other',
        usedFixtureNames,
      )
      // Build a minimal fixture: the JSX template as-is (after standard JSX-→Svelte translation).
      const jsxText = jsxArg.getText().trim()
      const template = jsxToSvelteTemplate(jsxText)
      const fixtureContent = `<script lang="ts">\n</script>\n\n${template}\n`
      fixtures.push({ name: `${fixtureName}.svelte`, content: fixtureContent })
      stats.fixturesEmitted++
      // Now rewrite the outer call: `vi.fn().mockReturnValue(<JSX/>)`
      // becomes `vi.fn(${fixtureName})`.
      // The `call` node is the whole `vi.fn().mockReturnValue(<JSX/>)`
      // expression (its callee is the `.mockReturnValue` member access).
      const ce = call.asKind(SyntaxKind.CallExpression)!
      const callee = ce.getExpression()
      if (callee.getKind() === SyntaxKind.PropertyAccessExpression) {
        const pae = callee.asKind(SyntaxKind.PropertyAccessExpression)!
        const inner = pae.getExpression() // the `vi.fn()` call
        if (
          inner.getKind() === SyntaxKind.CallExpression &&
          inner.asKind(SyntaxKind.CallExpression)!.getExpression().getText() ===
            'vi.fn'
        ) {
          call.replaceWithText(`vi.fn(${fixtureName})`)
          continue
        }
      }
      // Fallback: replace the whole chain as a tagged vi.fn.
      call.replaceWithText(`vi.fn(${fixtureName})`)
    }
  }

  // ----- Step 2.5: Catch residual JSX -----
  // Any JSX that escaped the lambda walk (e.g. inside a FunctionDeclaration,
  // inside a `const X = () => <JSX/>` not classified by context, or in some
  // helper expression) would break vite/oxc's TypeScript parser. Replace each
  // outermost residual JSX expression with `(null as any) /* TODO ... */ ` so
  // the file at least parses. The test will then fail with a real runtime
  // error pointing to the missing piece, which is far more useful than a
  // parse error.
  {
    const residualJsx = sf
      .getDescendants()
      .filter((d) => isJsxNode(d))
      .filter((j) => {
        let p = j.getParent()
        while (p) {
          if (isJsxNode(p)) return false
          p = p.getParent()
        }
        return true
      })
    // Replace from the end so offsets stay valid
    residualJsx.sort((a, b) => b.getStart() - a.getStart())
    for (const jsx of residualJsx) {
      const original = jsx
        .getText()
        .replace(/\*\//g, '* /')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 200)
      const line = jsx.getStartLineNumber()
      jsx.replaceWithText(
        `(null as any /* TODO(svelte-port): residual JSX at line ${line}: ${original} */)`,
      )
      todos.push({
        location: `${basename(inputPath)}:${line}`,
        message: `Residual JSX stubbed as null — hand-port: ${original.slice(0, 80)}`,
      })
      stats.todosEmitted++
    }
  }

  // ----- Step 2.7: Translate Solid Accessor() → Svelte .current -----
  // Hook results in our adapter are `{ current: T }` getters, not callable Accessors.
  // Rewrite `xxx()` → `xxx.current` for any variable assigned from a known hook call,
  // and rewrite `useHook(...)()` chained inline calls similarly.
  {
    const HOOK_NAMES = new Set([
      'useRouter',
      'useRouterState',
      'useMatch',
      'useMatches',
      'useMatchRoute',
      'useParentMatches',
      'useChildMatches',
      'useLocation',
      'useParams',
      'useSearch',
      'useLoaderData',
      'useLoaderDeps',
      'useRouteContext',
      'useCanGoBack',
      'useBlocker',
      'useHydrated',
      'useTags',
      'useElementScrollRestoration',
    ])

    // Step 1: identify variables whose initializer is a hook call.
    // We track names ascending: `const x = useFoo()`, `let y = routeApi.useBar()`,
    // and destructured patterns are skipped (those aren't accessor-style).
    const hookVarNames = new Set<string>()
    sf.getDescendantsOfKind(SyntaxKind.VariableDeclaration).forEach((vd) => {
      const initializer = vd.getInitializer()
      if (!initializer) return
      if (initializer.getKind() !== SyntaxKind.CallExpression) return
      const call = initializer.asKind(SyntaxKind.CallExpression)!
      const calleeText = call.getExpression().getText()
      const finalName = calleeText.split('.').pop() ?? calleeText
      if (!HOOK_NAMES.has(finalName)) return
      const name = vd.getNameNode().getText()
      // Skip destructured patterns
      if (name.startsWith('{') || name.startsWith('[')) return
      hookVarNames.add(name)
    })

    // Step 2: replace `varName()` calls with `varName.current` access.
    // Sort by position descending so offsets stay valid.
    const callsToRewrite: Array<{
      call: Node
      isMemberOfCallChain: boolean
    }> = []

    sf.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
      const expr = call.getExpression()
      if (call.getArguments().length !== 0) return
      // Pattern A: `varName()` where varName is a tracked hook variable
      if (
        expr.getKind() === SyntaxKind.Identifier &&
        hookVarNames.has(expr.getText())
      ) {
        callsToRewrite.push({ call, isMemberOfCallChain: false })
        return
      }
      // Pattern B: `useHook(...)()`  — chained no-arg call on a hook call result
      if (expr.getKind() === SyntaxKind.CallExpression) {
        const inner = expr.asKind(SyntaxKind.CallExpression)!
        const innerCallee = inner.getExpression().getText()
        const finalName = innerCallee.split('.').pop() ?? innerCallee
        if (HOOK_NAMES.has(finalName)) {
          callsToRewrite.push({ call, isMemberOfCallChain: true })
        }
      }
    })

    // Sort descending
    callsToRewrite.sort((a, b) => b.call.getStart() - a.call.getStart())
    for (const { call, isMemberOfCallChain } of callsToRewrite) {
      if (isMemberOfCallChain) {
        // `expr()` where expr is `useHook(...)` → `expr.current`
        const innerText = call
          .asKind(SyntaxKind.CallExpression)!
          .getExpression()
          .getText()
        call.replaceWithText(`${innerText}.current`)
      } else {
        // `varName()` → `varName.current`
        const varName = call
          .asKind(SyntaxKind.CallExpression)!
          .getExpression()
          .getText()
        call.replaceWithText(`${varName}.current`)
      }
    }
  }

  // ----- Step 3: Rewrite `render(() => <X />)` calls -----
  // After the lambda transformations above, render-call lambdas have been replaced with
  // either a snippet variable name or a fixture component name. Re-scan and rewrite shape:
  //   render(SOMETHING)            (where SOMETHING is now a Component or Snippet)
  //   render(<X prop={v}/>)        legacy form, less common
  // We want: render(C, { props: {...} }) when C is a Component.
  // For now, keep the original `render(SOMETHING)` shape — testing-library/svelte's render
  // accepts a Component directly as first arg, and a Snippet doesn't render with render() directly.
  // The hand-port handles this; the compiler emits raw render() for further attention.

  // ----- Step 4: Add fixture imports + snippet declarations + createRawSnippet import -----
  if (snippetDeclarations.length > 0 || needsCreateRawSnippet.value) {
    // Add `import { createRawSnippet } from 'svelte'` if not already present
    const existingSvelteImport = sf
      .getImportDeclarations()
      .find((i) => i.getModuleSpecifierValue() === 'svelte')
    if (existingSvelteImport) {
      const named = existingSvelteImport
        .getNamedImports()
        .map((n) => n.getName())
      if (!named.includes('createRawSnippet')) {
        existingSvelteImport.addNamedImport('createRawSnippet')
      }
    } else {
      sf.addImportDeclaration({
        moduleSpecifier: 'svelte',
        namedImports: ['createRawSnippet'],
      })
    }
  }

  // Add fixture default-imports for each emitted fixture
  for (const fixture of fixtures) {
    const name = fixture.name.replace(/\.svelte$/, '')
    sf.addImportDeclaration({
      moduleSpecifier: `./fixtures/${name}.svelte`,
      defaultImport: name,
    })
  }

  // Add `_shared` import if any fixture/test uses it.
  if (sharedVars.size > 0) {
    sf.addImportDeclaration({
      moduleSpecifier: './shared.svelte',
      namedImports: ['_shared'],
    })
  }

  // Insert snippet declarations after the last import
  if (snippetDeclarations.length > 0) {
    const lastImport = sf.getImportDeclarations().slice(-1)[0]
    const importEnd = lastImport?.getEnd() ?? 0
    const declBlock = '\n\n' + snippetDeclarations.join('\n\n') + '\n'
    sf.insertText(importEnd, declBlock)
  }

  // ----- Step 4.5: Apply `.j2signore` skips -----
  // Rewrite matching `test(name, ...)` (or `test.each(...)(...)`) callees to
  // `test.skip(...)` so vitest reports them as skipped rather than failing.
  // These are tests that exercise Solid-specific framework behavior we can't
  // mirror in Svelte without disproportionate adapter rework.
  {
    const fileBase = basename(inputPath).replace(/\.test\.tsx?$/, '')
    const ignoreNames = IGNORE_LIST.perFile.get(fileBase)
    if (ignoreNames && ignoreNames.size > 0) {
      const skipAll = ignoreNames.has('*')
      sf.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
        const callee = call.getExpression()
        // Match `test(...)` and `test.each(...)(...)`. For the chained form
        // the outer call's callee is `test.each(...)` (a CallExpression).
        let isPlainTest = false
        let isEachTest = false
        if (
          callee.getKind() === SyntaxKind.Identifier &&
          callee.getText() === 'test'
        ) {
          isPlainTest = true
        } else if (callee.getKind() === SyntaxKind.CallExpression) {
          const innerCallee = callee
            .asKind(SyntaxKind.CallExpression)!
            .getExpression()
          if (
            innerCallee.getKind() === SyntaxKind.PropertyAccessExpression &&
            innerCallee.getText() === 'test.each'
          ) {
            isEachTest = true
          }
        }
        if (!isPlainTest && !isEachTest) return
        // The test name is the first string-literal argument.
        const args = call.getArguments()
        const nameArg = args.find(
          (a) =>
            a.getKind() === SyntaxKind.StringLiteral ||
            a.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral,
        )
        if (!nameArg) return
        const nameText =
          nameArg.getKind() === SyntaxKind.StringLiteral
            ? nameArg.asKind(SyntaxKind.StringLiteral)!.getLiteralValue()
            : nameArg.getText().slice(1, -1)
        if (!skipAll && !ignoreNames.has(nameText)) return
        // Replace the callee identifier or `test.each(...)` chain with the
        // `.skip` form.
        if (isPlainTest) {
          callee.replaceWithText('test.skip')
        } else if (isEachTest) {
          const innerCall = callee.asKind(SyntaxKind.CallExpression)!
          // `test.each(rows)` → `test.skip.each(rows)`. Replacing the inner
          // `test.each` member access is enough.
          const innerCallee = innerCall.getExpression()
          innerCallee.replaceWithText('test.skip.each')
        }
      })
    }
  }

  // ----- Step 5: Convert .tsx → .ts in test file name -----
  // (handled by caller via outputPath)

  // Build the shared.svelte.ts content if needed
  let sharedModule: string | null = null
  if (sharedVars.size > 0) {
    const lines: Array<string> = []
    lines.push('// Auto-generated by port-tests. Mutable shared storage for closure-captured values')
    lines.push('// referenced by fixture .svelte files.')
    lines.push('export const _shared: Record<string, any> = {}')
    sharedModule = lines.join('\n') + '\n'
  }

  return {
    outputCode: sf.getFullText(),
    fixtures,
    sharedModule,
    todos,
    stats,
  }
}

function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const positional = args.filter((a) => !a.startsWith('--'))
  if (positional.length === 0) {
    console.error(
      'usage: port-tests [--dry-run] <input.test.tsx> [output-dir]',
    )
    process.exit(2)
  }

  const inputPath = resolve(positional[0]!)
  const outputDir = positional[1] ? resolve(positional[1]) : dirname(inputPath)

  const result = port(inputPath)

  const outFileName = basename(inputPath).replace(/\.test\.tsx?$/, '.test.ts')
  const outFilePath = join(outputDir, outFileName)

  console.log(`\n[port-tests] ${inputPath} → ${outFilePath}`)
  console.log(`  imports rewritten:   ${result.stats.importsRewritten}`)
  console.log(`  snippets emitted:    ${result.stats.snippetsEmitted}`)
  console.log(`  fixtures emitted:    ${result.stats.fixturesEmitted}`)
  console.log(`  todos emitted:       ${result.stats.todosEmitted}`)
  if (result.todos.length > 0) {
    console.log('\n  TODOs:')
    for (const t of result.todos) {
      console.log(`    ${t.location}: ${t.message}`)
    }
  }

  if (dryRun) {
    console.log('\n--- dry run: would write output ---')
    console.log(result.outputCode)
    if (result.fixtures.length > 0) {
      console.log('\n--- fixtures ---')
      for (const f of result.fixtures) {
        console.log(`\n[${f.name}]`)
        console.log(f.content)
      }
    }
    return
  }

  mkdirSync(outputDir, { recursive: true })
  writeFileSync(outFilePath, result.outputCode)
  if (result.fixtures.length > 0) {
    const fixturesDir = join(outputDir, 'fixtures')
    mkdirSync(fixturesDir, { recursive: true })
    for (const f of result.fixtures) {
      writeFileSync(join(fixturesDir, f.name), f.content)
    }
  }
  if (result.sharedModule) {
    writeFileSync(join(outputDir, 'shared.svelte.ts'), result.sharedModule)
  }
}

// Only run as a CLI when invoked directly, not when imported as a module.
// `pathToFileURL` handles Windows-style paths correctly (file:///C:/…).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
