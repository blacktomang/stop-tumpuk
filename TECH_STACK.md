# Technical stack

**Status:** Existing application stack retained for PRD v2.1. The simplification revision is planned, not implemented; physical-device validation remains a release gate.

**Scope authority:** [PRD.md](PRD.md). Delivery order: [MILESTONES.md](MILESTONES.md).

**Purpose:** Record implementation choices without creating additional product requirements.

## Existing choices and revision constraints

| Area                     | Choice                                                         | Reason                                                                                                                 |
| ------------------------ | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Application              | React + TypeScript, strict mode                                | Typed component UI with business rules in independent TypeScript modules                                               |
| Build                    | Vite                                                           | Static SPA build and development server; server rendering is unnecessary for the current workflow                      |
| Navigation               | Existing single-screen composition                             | Keep the current feature boundaries and dialogs; this revision does not require a router                               |
| Styling                  | Tailwind CSS                                                   | Responsive utility styling with a shared design-token theme                                                            |
| Accessible UI primitives | Headless UI                                                    | Accessible, unstyled interactive primitives such as dialogs, menus, and listboxes that Tailwind styles can compose     |
| Icons                    | Heroicons for React                                            | Consistent, accessible SVG icons that inherit the surrounding UI color                                                 |
| Persistence              | IndexedDB via Dexie                                            | Structured local data, indexes, transactions, and one-time prototype replacement, then versioned production migrations |
| UI data subscriptions    | Dexie live queries through repository-facing hooks             | Refresh views after local changes without duplicating persisted data in a global store                                 |
| Runtime validation       | Explicit TypeScript guards at untrusted boundaries             | Validate providers/shares/imports; add conversions for supported released formats as production formats evolve         |
| PWA                      | `vite-plugin-pwa`, custom service worker with `injectManifest` | App-shell caching plus control over incoming share POST handling                                                       |
| Domain/unit tests        | Vitest                                                         | Verify pure rules and application services                                                                             |
| UI tests                 | Deferred until a UI-testing dependency is added                | Use existing Vitest and Playwright coverage; no component-test package is required for this revision                   |
| Storage tests            | Vitest with `fake-indexeddb`                                   | Validate initialization/persistence/imports now, and released-schema migrations when production formats evolve         |
| Browser tests            | Playwright                                                     | Validate the primary workflow against a production build; native share still needs physical-device validation          |
| Formatting/linting       | Prettier + ESLint with `typescript-eslint`                     | Prettier is the formatting authority; ESLint parses TypeScript and handles static code checks                          |
| Packages                 | pnpm, one committed `pnpm-lock.yaml`                           | Fast, reproducible installs without multiple package managers                                                          |
| Hosting                  | HTTPS static hosting with SPA rewrites                         | No core runtime server; preserve navigable routes and PWA scope                                                        |

Tailwind's theme is the source for visual tokens such as colors, type scale, spacing, breakpoints, and motion preferences. Use Headless UI for interactive patterns that need keyboard and focus management. Build simple semantic elements directly when a primitive is unnecessary. Do not use a second component framework or add custom JavaScript interactions that duplicate Headless UI behavior.

These choices reflect the existing manifest and source layout. Retain them for the revision. Build the FR-06 capacity bar with semantic HTML and Tailwind, and FR-12 menus with Headless UI; no chart library, scheduler, router, or new state store is required. Do not add Redux, a backend, or speculative testing/validation packages. Any necessary dependency change must be purposeful and documented here.

## Versions and commands

The repository pins Node 24.22.2 in `.nvmrc`; `package.json` requires Node >=22 and pnpm >=10. There is no exact pnpm pin in the manifest. Keep pnpm and the existing `pnpm-lock.yaml`; do not invent a verified runtime version or add another lockfile. The version files and manifest/lockfile remain authoritative.

The following commands exist in the current package setup:

| Command                          | Purpose                                                       |
| -------------------------------- | ------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | Install the committed dependency tree after a lockfile exists |
| `pnpm dev`                       | Start local development                                       |
| `pnpm typecheck`                 | Check application and worker TypeScript                       |
| `pnpm lint`                      | Run static code checks                                        |
| `pnpm format:check`              | Check formatting                                              |
| `pnpm test`                      | Run existing Vitest unit/storage tests once                   |
| `pnpm build`                     | Produce static assets and the production service worker       |
| `pnpm preview`                   | Serve the production build locally                            |
| `pnpm test:e2e`                  | Run Playwright against a production build                     |

These commands require installed dependencies. `pnpm format` also exists and rewrites formatting; use targeted Prettier formatting for a focused file change. The existing Playwright configuration runs Chromium and starts a production build/preview. Install its browser with `pnpm exec playwright install chromium` when needed; adding other engine projects is explicit release-validation work, not existing coverage.

## Verification policy

`pnpm typecheck` is the normal completion check for an ordinary TypeScript feature. Do not run a production build or Playwright as a routine finish step. Use the smallest relevant verification beyond type checking: targeted unit, storage, or UI tests for changed logic; `pnpm build` for build/PWA/deployment changes; and `pnpm test:e2e` only for changed end-to-end behavior, browser-specific regressions, or milestone and release validation. The contributor rules in [AGENTS.md](AGENTS.md) are authoritative for this workflow.

## Platform and integration boundaries

The browser acceptance scope is owned by PRD section 15 and the milestones. Start validation with the guaranteed paste-to-completion path in Chromium, Firefox, and WebKit; these engines do not substitute for physical-device validation. Test incoming sharing separately on an installed Android Chrome PWA. Keep exact browser/device versions in verification records rather than promising universal support here.

Metadata adapters use browser `fetch` only when the provider permits it. API keys are optional deployment configuration, never prerequisites for the core release. A browser-visible API key cannot be treated as a secret; restrict any configured key to its intended API and deployment origins where supported. Do not introduce a generic public CORS proxy or undocumented scraping dependency.

Do not add an extraction dependency to replace the removed pasted-text UI. Existing provider boundaries may supply complete-text calculations under FR-03/FR-04, but they do not solve access restrictions. Unknown duration falls back to manual estimated minutes. No AI SDK or inference service is needed. Remove retired preference fields directly. Follow the schema-replacement design in [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md); no prototype migration adapters or new storage library are required for Milestone 1. For production schema changes, use Dexie versioned upgrades and tested conversions for supported released backup formats; keep schema/migration definitions together. The one-time prototype replacement is not a production reset policy. Current-format validation and export/import remain part of the existing stack.

## References

Reference links retained from the November 6, 2026 stack review; not revalidated during this documentation-only revision. Recheck relevant APIs and engine requirements when changing dependencies.

- [React: building an app from scratch](https://react.dev/learn/build-a-react-app-from-scratch)
- [Vite guide](https://vite.dev/guide/)
- [Dexie documentation](https://dexie.org/docs)
- [Vite PWA: custom service worker](https://github.com/vite-pwa/vite-plugin-pwa/blob/main/docs/guide/inject-manifest.md)
- [Playwright service-worker testing](https://playwright.dev/docs/service-workers)
- [Playwright emulation](https://playwright.dev/docs/emulation)
