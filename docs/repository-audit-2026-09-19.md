# Repository audit — 19 September 2026

Reviewed commit `e3f9429f`. The findings and baseline below describe the initial audit. The subsequent implementation is recorded at the end. Priorities express recommended order of work; they are not vulnerability severity ratings. Runtime failure modes identified by inspection are distinguished from measured results.

The architecture is in good shape: typed content, strict TypeScript, reusable filter logic, generated lightweight projections, lazy visualization libraries, static prerendering, and meaningful CI checks. Incremental improvements are appropriate; a broad rewrite would add risk without a demonstrated benefit.

## Verification

| Check                          | Result                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `npm run lint`                 | Passed                                                                                                    |
| `npm run check`                | Zero errors or warnings                                                                                   |
| `npm run test:coverage`        | 56 files, 966 tests passed                                                                                |
| Coverage                       | Statements 60.23%; branches 55.52%; functions 66.76%; lines 61.36%                                        |
| `npm run build`                | Passed                                                                                                    |
| `npm run check:build`          | Passed; 238 image sources current; all 198 sitemap URLs have output                                       |
| Bundle guard                   | Entry 109.0 KiB; largest individual route-node graph 546.0 KiB; see finding 5                             |
| `npm run mcp:check`            | Passed                                                                                                    |
| `npm run mcp:smoke`            | 65/65 checks passed, including installed bundle                                                           |
| Production Playwright suite    | 35 passed, one intentional desktop skip of a mobile-only test; Chromium, mobile Chromium, Firefox, WebKit |
| `npm audit --audit-level=high` | One moderate advisory, no high/critical findings; exits successfully at this threshold                    |

MCP and browser checks initially encountered sandbox restrictions and passed after authorized reruns outside the sandbox. The initial blocked browser run was stopped. Builds and test reports are ignored artifacts. Lighthouse, external-link crawling, font freshness, and live-deployment behavior were not independently rerun. This was a broad architecture/code/test review, not a line-by-line verification of every content record or a penetration test.

## Findings and recommended work

### 1. Service-worker cache work needs explicit lifetime and error handling

**Priority: high. Effort: medium. Evidence: code inspection.**

Locations: [service-worker.js](../src/service-worker.js), especially lines 134–187 and 190–211; [PWA tests](../tests-e2e/pwa.spec.ts).

The stale-while-revalidate path returns cached content immediately but does not attach its background fetch/write to `event.waitUntil`. Cache-first and ordinary network-first paths also launch cache writes without awaiting or tracking them. The browser can finish the event before that work completes; write failures can become unhandled rejections. Conversely, the preload path awaits the cache write inside the network `try`, so a cache quota failure can discard a perfectly usable network response and enter the offline fallback.

Pass the fetch event through the strategies and explicitly keep background work alive. Catch cache-storage failures separately from network failures, preserving valid online responses. The [worker lifetime documentation](https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil) explains why returning a response alone is insufficient for background work.

Useful tests: cached JSON refresh after returning stale content; visited-page reload offline; unvisited-page fallback; cache-write rejection while the network succeeds; update acceptance and deferral. The current PWA E2E test checks registration count only, while unit tests cover route selection rather than these strategies.

### 2. Resolve the installed devalue advisory

**Priority: high for dependency maintenance; observed advisory severity: moderate. Effort: small.**

Locations: [package.json](../package.json), line 90, and [package-lock.json](../package-lock.json).

The installed dependency graph resolves `devalue@5.8.1` through Svelte and SvelteKit. npm reports [GHSA-9rgm-9g3h-6x36](https://github.com/advisories/GHSA-9rgm-9g3h-6x36), a denial-of-service issue involving malformed input to `devalue.parse`. The advisory narrative identifies 5.9.2 as fixed, although its affected-version range currently uses a different cutoff. Verify the upstream registry and release notes when applying the update rather than inferring a safe pin from that cutoff.

Update the lockfile and review the override floor, then rerun audit, build, and tests. The existing `>=5.8.1` override permits newer versions but does not update the committed lockfile. No exploitable path was demonstrated in this statically deployed site; this is a confirmed dependency finding, not evidence of a vulnerable public server. CI's high-severity threshold intentionally does not fail on this moderate advisory.

### 3. Make malformed content fail before it disappears from the corpus

**Priority: medium. Effort: small to medium. Evidence: code inspection.**

Locations: [dataLoader.ts](../src/lib/utils/dataLoader.ts), lines 73–158; [dataIntegrity.test.ts](../src/lib/data/dataIntegrity.test.ts), lines 23–83; [data-records.mjs](../scripts/lib/data-records.mjs).

`loadData` skips invalid modules, absent records, and transformation failures; production diagnostics are suppressed. Integrity tests validate the resulting arrays and minimum sizes, which cannot establish that every expected source file survived loading. The build-time record collector also silently skips modules without a recognized record. Existing publication/communication projection parity tests provide useful additional protection, but are not a general raw-source completeness check.

Distinguish explicitly excluded templates/helpers from malformed content and fail the build for the latter, including the source path. Alternatively, expose loader diagnostics and assert that there are no unexpected exclusions. Add fixture tests for missing IDs, two candidate exports, and thrown transforms; verify source-file-to-output coverage. Keep forgiving runtime behavior only where there is a concrete reason for it.

### 4. Eliminate repeated facet aggregation

**Priority: medium. Effort: small. Evidence: measured.**

Locations: [entityFilterCore.ts](../src/lib/utils/entityFilterCore.ts), lines 75–90 and 122–169; [entityFilterSystem.svelte.ts](../src/lib/utils/entityFilterSystem.svelte.ts).

For each counted dimension, `computeDisjunctiveFacetCounts` computes counts for every dimension and retains only one. A direct probe with 100 items and the current six dimensions made **3,600 extractor calls instead of 600**. The separate totals derivation repeats the eligibility filtering too.

Extract a single-dimension counter and return both counts and total from each eligible subset. Preserve OR-within/AND-across semantics and multi-valued fields. Existing pure tests are a strong regression base; add a representative equivalence fixture and operation-count or benchmark check if useful. This is a sixfold reduction in extraction work, not a claim that the whole page will become six times faster. The corpus is small, so avoid premature indexing machinery.

### 5. Count layout dependencies in route bundle budgets

**Priority: medium. Effort: small. Evidence: measured against this build.**

Location: [check-bundle-budget.mjs](../scripts/check-bundle-budget.mjs), particularly lines 89–107 and 167–177.

The route budget traverses the app entry, Kit entry, and one page node. The root layout is a separate node and its additional imports are omitted from that page's total. Individual layout checks do not correct the combined page measurement.

| Page                 | Current guard graph | Including root layout |
| -------------------- | ------------------: | --------------------: |
| Home                 |           382.5 KiB |             432.9 KiB |
| Publication detail   |           428.9 KiB |             474.8 KiB |
| Communication detail |           481.0 KiB |             526.8 KiB |
| Style guide          |           546.0 KiB |             591.8 KiB |

These are uncompressed JavaScript graph sizes, not network transfer sizes. Construct the actual route's layout-plus-page graph and deduplicate chunks. Also fail clearly when expected manifest roots or emitted files are missing; currently unknown graph keys are skipped and missing files contribute zero bytes. Test the guard with small manifest fixtures, including shared chunks and missing outputs. Keep the existing heavy-library and D3 direction checks.

### 6. Move full-corpus detail loading into prerender-time server loaders

**Priority: medium. Effort: medium. Evidence: imports and emitted graph; savings not yet prototyped.**

Locations: publication and communication `[id]/+page.ts` loaders and their accompanying `+page.svelte` components. Both loaders import the entire dataset, and both components import it again for related items/project links.

A single record page therefore depends on the complete corpus, including other records' heavy fields. Moving only the loader will not solve this: the component imports must also go. Return the selected record, JSON-LD, and small related-item projections from `+page.server.ts`; preserve prerender entries and verify generated navigation data. The same question applies to homepage Person-schema construction in `src/routes/+page.ts`.

SvelteKit supports [server loaders during prerendering](https://svelte.dev/docs/kit/load#Universal-vs-server), so this does not inherently require a deployed application server. Measure the before/after build graph and compressed transfer before widening the refactor. Test direct entry, client navigation, related links, citations, and unknown IDs.

### 7. Bound and validate MCP dataset fetching

**Priority: medium. Effort: small to medium. Evidence: code inspection.**

Location: [mcp/src/datasets.ts](../mcp/src/datasets.ts), lines 49–95.

Fetches have no application timeout, JSON is cast to `T` without runtime validation, and successful promises remain cached for the entire process lifetime. Rejected fetches are correctly evicted, but a hanging request stays shared until it settles, and valid JSON with the wrong shape is cached successfully. A long-lived HTTP deployment also stays stale across content updates until restart; this is an explicit current tradeoff, not an accidental implementation omission.

Add a bounded fetch timeout, validate the envelope/version/items before caching, and use a configurable freshness policy for HTTP deployments. Keep in-flight deduplication and rejection eviction. Test timeout and retry, malformed JSON, wrong shape/version, concurrent callers, and refresh after expiration. A shared small schema contract would reduce drift between `apiPayload.ts` and MCP's broad `Item` type.

### 8. Tie MCP release identity to the built artifact

**Priority: medium. Effort: small. Evidence: workflow inspection.**

Locations: [release-mcp.yml](../.github/workflows/release-mcp.yml), lines 48–85; [mcp/pack.mjs](../mcp/pack.mjs), line 93.

The workflow builds the bundle before resolving the release version. Tags and manual input determine the release name, while the bundle manifest always reads `mcp/package.json`. A tag or override that differs from the package version can publish an artifact identifying itself as a different version.

Resolve and validate the version before building, then require equality with the package version or explicitly propagate the selected version into packaging. Inspect the packed manifest before publishing. A deliberate mismatch should fail before release creation. The current smoke check validates the entry point and tool list but not release-to-manifest identity.

### 9. Add browser tests for real user outcomes and failure recovery

**Priority: medium. Effort: medium, spread across feature changes.**

The unit suite is strong on pure transformations. Its Node-only configuration deliberately avoids compiling Svelte runes and stubs the theme store, so lifecycle behavior needs browser coverage. Current E2E tests provide useful smoke coverage but do not exercise several important outcomes.

The most useful additions, in order:

1. Offline and service-worker update scenarios from finding 1.
2. CV PDF, chart PNG, and BibTeX downloads: assert nonempty files and expected signatures/content. Exercise font failure and clipboard denial. Avoid byte-for-byte PDF snapshots.
3. Search plus multiple facets, pagination after narrowing, reload, back/forward, repeated query parameters, and filters on conference activity as well as publications.
4. Client-side navigation between two detail records: exactly one canonical URL/record JSON-LD, no outgoing DOM left behind, correct related items.
5. Chart/map lifecycle: navigate away during import, resize, theme change, empty data, failed import, retry, and disposal.
6. Real HTTP-process MCP tests: the current HTTP smoke path calls `handler.fetch` in-process, bypassing `mcp/src/http.ts`, host checks, routing, and shutdown.

Add a shared page-error collector for interaction tests, with explicit handling of expected failures. In `a11y.spec.ts`, a visible H1 does not prove hydration because headings are prerendered; use feature readiness before checking interactive states. Open menus/facet popovers and test keyboard use as well as resting-page axe scans.

### 10. Make visualization loading failures recoverable

**Priority: medium. Effort: small to medium. Evidence: code inspection; failure injection not performed.**

Locations: [maplibre.ts](../src/lib/utils/maplibre.ts), lines 35–71; [useECharts.svelte.ts](../src/lib/utils/useECharts.svelte.ts), lines 145–209; [NetworkGraph.svelte](../src/lib/components/visualisations/NetworkGraph.svelte), line 273.

The MapLibre loader caches a rejected import promise permanently for that document, so subsequent callers cannot make a fresh attempt. Reset the loader's cached promise on rejection; test recovery with a controlled loader, recognizing that browser module caching can also constrain retries. The D3 import chain has no rejection handler. ECharts errors are DEV-only console messages and the hook exposes no failure state; when `hasData()` turns false, it skips updating rather than clearing the previous chart.

Expose explicit loading/ready/error states where the user needs feedback, retain the data table fallback, handle rejected enhancement imports, and define the populated-to-empty contract. These are focused lifecycle improvements; the shared hooks themselves are worth retaining.

### 11. Remove obsolete CV waiting and protect export behavior

**Priority: low. Effort: small. Evidence: code inspection.**

Locations: [pdfCvLayout.ts](../src/lib/utils/pdfCvLayout.ts), lines 83–99; [CV route](../src/routes/cv/+page.svelte), lines 13–36.

`waitForCvSections` still assumes delayed section imports, polls for an arbitrary minimum of 12 sections, and always adds 200 ms. The route now imports every section statically. Replace this with the actual readiness requirement, or remove the wait after confirming the export needs no layout tick. Test exported content for the expected sections. Keep the existing font-failure fallback; it solves a real problem.

### 12. Consolidate build metadata and local quality commands

**Priority: low. Effort: small to medium. Evidence: code inspection.**

Template IDs and directory-to-publication-type mappings are duplicated between Vite loaders and Node generators, with explicit “keep in sync” comments. Put these plain constants into an alias-free, erasable TypeScript module that both environments can import. Keep projection parity tests after consolidation.

`test:all` omits coverage enforcement, generated-file freshness, build-output checks, and MCP verification even though CI runs them. Offer one documented local verification command that mirrors the deterministic CI sequence and builds once. This would reduce drift without making slow network checks mandatory on every edit.

The coverage floors (52/48/59/52) are below today's measured baseline. Ratchet them conservatively after stabilizing meaningful tests; do not chase global 100%. Separate pure logic from browser lifecycle coverage so a single percentage does not conceal where behavior is untested. The CI cache targets `node_modules/.cache`, while Vitest is configured to persist transforms under `node_modules/.vitest-cache`; measure whether caching the actual directory is worth the upload cost.

Large visualization routes and `LocationMap.svelte` are reasonable candidates for extraction by responsibility: aggregation, chart configuration, boundary loading, and map layers. Keep route-specific code explicit and preserve dynamic-import boundaries. File size alone is not a reason to introduce a general configuration framework, especially for the intentionally comprehensive style guide.

## Suggested implementation sequence

1. Address the dependency advisory and service-worker reliability, with focused regression tests.
2. Correct bundle accounting and remove redundant facet work; both have measurable acceptance criteria.
3. Add source completeness validation and MCP timeout/schema/release-version checks.
4. Prototype server-side detail loaders and compare actual transfer costs.
5. Expand download/navigation/lifecycle tests, then simplify obsolete helpers and shared generator metadata.

No source changes, dependency updates, commits, or deployments were made as part of this audit.

## Implementation follow-up

The user subsequently authorized implementation. All twelve findings have corresponding
changes in the working tree:

1. Service-worker strategies now return separate response/background promises. The fetch
   listener registers both synchronously, preserves successful responses when storage
   fails, and handles cold offline requests explicitly. Regression tests exercise cache
   failures, stale revalidation, navigation preload, and offline fallbacks.
2. The `devalue` override is `^5.9.4`, with the lockfile updated after checking the npm
   registry. The production dependency audit reports zero vulnerabilities.
3. Vite loaders and Node generators share strict source-record selection. Missing,
   ambiguous, invalid, and duplicate IDs fail with source paths instead of disappearing.
4. Facet counts and totals share each dimension's eligible subset. Counting no longer
   extracts every other dimension repeatedly; an operation-count regression guards this.
5. Bundle budgets traverse each route's actual layout chain and leaf, deduplicate files,
   and fail on missing manifest entries or emitted files. Synthetic graph tests cover
   shared layouts, dynamic imports, and incomplete output.
6. Publication/communication detail loads and homepage schema generation run during
   prerendering. Detail pages receive one record and three small related-item projections.
7. MCP fetches validate the shared API envelope, enforce a 10-second request/body deadline,
   deduplicate concurrent loads, expire successful entries after five minutes, and evict
   failures. Configuration, expiry, malformed documents, and stalled bodies are tested.
8. Releases reject mismatched package/input/tag versions before building. Packaged-artifact
   smoke tests also verify the embedded manifest version.
9. Browser tests exercise PDF/BibTeX/PNG output, font and clipboard failure, URL/history and
   pagination behavior, SPA detail navigation and metadata, real offline reloads, update
   prompts, open combobox accessibility, and uncaught page errors. MCP smoke tests spawn
   the actual HTTP process, checking host rejection, routing, tools, and graceful shutdown.
10. Charts expose failures, clear stale plots on empty data, and offer retry/reload controls.
    Map imports and boundary data can retry rejected loads. Network enhancements catch
    failures. Compiled Svelte tests cover lifecycle updates, late completion, and disposal.
    Browser failure injection confirmed that Chromium may retain a failed module load;
    reload is provided as the reliable fallback. Error layouts were inspected at 375px
    and 1280px. Open-facet testing also found and fixed scrolling on the wrong wrapper:
    the controlled listbox now owns its scroll region.
11. CV export no longer waits on the obsolete section polling timer. Both embedded-font
    and font-fallback PDFs are checked for valid output and multiple pages.
12. Template/type metadata is shared; country-boundary loading has its own tested module.
    `npm run verify` runs the deterministic quality sequence with one build; CI also runs
    lifecycle tests and caches the configured Vitest directory. Coverage floors increased
    to 60/55/66/61 for statements/branches/functions/lines. Broader visualization rewrites
    were unnecessary for these fixes.

Measured static JavaScript graphs, including the application entry and layouts (raw KiB,
not compressed transfer bytes or lazy libraries):

| Route                | Before | After | Reduction |
| -------------------- | -----: | ----: | --------: |
| Homepage             |  432.9 | 430.9 |      0.5% |
| Publication detail   |  474.8 | 311.4 |     34.4% |
| Communication detail |  526.8 | 291.0 |     44.8% |

The homepage still shares other content-bearing components; moving schema generation alone
does not remove those dependencies. The largest complete route graph is the style guide,
approximately 593 KiB, below the existing 850 KiB budget.

Final validation: `npm run verify` passed end to end, including 999 unit tests across 63
files, six compiled Svelte lifecycle tests, 72 MCP checks, and 50 browser tests. One
intentional desktop skip remains for the mobile-only test, which passes in the mobile
project. Chromium, mobile Chromium, Firefox, and WebKit checks passed. Type checking
reported no errors or warnings; all 198 advertised URLs, 238 image sources, and ten font
subsets passed freshness/output checks. Coverage was 60.10% statements, 55.10% branches,
66.91% functions, and 61.25% lines, above the raised floors. `npm audit --omit=dev`
reported zero vulnerabilities. The final documentation and smoke-test cleanup also
passed formatting/lint and `git diff --check`.

A final mobile screenshot correction prevents the recovery panel from shrinking around
its buttons. Its rebuilt browser recovery/accessibility checks, Svelte check, and targeted
lint passed; the browser test now asserts that the reload button stays inside the panel.

Changes remain uncommitted and undeployed. Live-network link/citation crawling,
Lighthouse scoring, and live-site validation were not part of this implementation run.
