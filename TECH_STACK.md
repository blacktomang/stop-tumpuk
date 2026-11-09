# Technical stack

**Status:** Working stack selection; Milestone 1 implementation is build-verified. Real-browser persistence and installed-PWA share-target validation remain release checks.  
**Scope authority:** [PRD.md](PRD.md). Delivery order: [MILESTONES.md](MILESTONES.md).  
**Purpose:** Record implementation choices without creating additional product requirements.

## Proposed choices

| Area                     | Choice                                                         | Reason                                                                                                             |
| ------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Application              | React + TypeScript, strict mode                                | Typed component UI with business rules in independent TypeScript modules                                           |
| Build                    | Vite                                                           | Static SPA build and development server; server rendering is unnecessary for the current workflow                  |
| Navigation               | Single-screen composition for Milestone 1                      | The capture/commitment workflow has no detail route yet; add routing only when a later milestone needs it          |
| Styling                  | Tailwind CSS                                                   | Responsive utility styling with a shared design-token theme                                                        |
| Accessible UI primitives | Headless UI                                                    | Accessible, unstyled interactive primitives such as dialogs, menus, and listboxes that Tailwind styles can compose |
| Icons                    | Heroicons for React                                            | Consistent, accessible SVG icons that inherit the surrounding UI color                                             |
| Persistence              | IndexedDB via Dexie                                            | Structured local data, indexes, transactions, and versioned schema migrations                                      |
| UI data subscriptions    | Dexie live queries through repository-facing hooks             | Refresh views after local changes without duplicating persisted data in a global store                             |
| Runtime validation       | Explicit TypeScript guards at untrusted boundaries             | Validate provider and incoming-share values without adding a schema dependency before import/export is in scope    |
| PWA                      | `vite-plugin-pwa`, custom service worker with `injectManifest` | App-shell caching plus control over incoming share POST handling                                                   |
| Domain/unit tests        | Vitest                                                         | Verify pure rules and application services                                                                         |
| UI tests                 | Deferred until a UI-testing dependency is added                | Focused domain tests cover Milestone 1 deterministic rules                                                         |
| Storage tests            | Deferred until `fake-indexeddb` is added                       | Real-browser persistence validation remains required before marking the milestone complete                         |
| Browser tests            | Deferred until Playwright is installed                         | Main workflow and production-build/offline checks remain release validation                                        |
| Formatting/linting       | Prettier + ESLint with `typescript-eslint`                     | Prettier is the formatting authority; ESLint parses TypeScript and handles static code checks                      |
| Packages                 | pnpm, one committed `pnpm-lock.yaml`                           | Fast, reproducible installs without multiple package managers                                                      |
| Hosting                  | HTTPS static hosting with SPA rewrites                         | No core runtime server; preserve navigable routes and PWA scope                                                    |

Tailwind's theme is the source for visual tokens such as colors, type scale, spacing, breakpoints, and motion preferences. Use Headless UI for interactive patterns that need keyboard and focus management. Build simple semantic elements directly when a primitive is unnecessary. Do not use a second component framework or add custom JavaScript interactions that duplicate Headless UI behavior.

These choices are recommendations for scaffolding. An alternative can be adopted by updating this document and preserving the PRD's constraints. Do not add Redux, a server-state cache, or a backend until a concrete need justifies it. Do not add the deferred testing or validation packages speculatively: introduce each when its milestone requires it and update this table in the same change.

## Versions and commands

The current environment uses Node and pnpm; record Node in `.nvmrc` and package versions in the manifest/lockfile. Those files are version authority.

Provide these scripts when the application is created:

| Intended command                 | Purpose                                                       |
| -------------------------------- | ------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | Install the committed dependency tree after a lockfile exists |
| `pnpm dev`                       | Start local development                                       |
| `pnpm typecheck`                 | Check application and worker TypeScript                       |
| `pnpm lint`                      | Run static code checks                                        |
| `pnpm format:check`              | Check formatting                                              |
| `pnpm test`                      | Run unit, storage, and UI tests once                          |
| `pnpm build`                     | Produce static assets and the production service worker       |
| `pnpm preview`                   | Serve the production build locally                            |
| `pnpm test:e2e`                  | Run Playwright against a production build                     |

These commands are available after dependencies are installed. Document browser binary installation alongside Playwright setup.

## Verification policy

`pnpm typecheck` is the normal completion check for an ordinary TypeScript feature. Do not run a production build or Playwright as a routine finish step. Use the smallest relevant verification beyond type checking: targeted unit, storage, or UI tests for changed logic; `pnpm build` for build/PWA/deployment changes; and `pnpm test:e2e` only for changed end-to-end behavior, browser-specific regressions, or milestone and release validation. The contributor rules in [AGENTS.md](AGENTS.md) are authoritative for this workflow.

## Platform and integration boundaries

The browser acceptance scope is owned by PRD section 15 and the milestones. Start validation with the guaranteed paste-to-completion path in Chromium, Firefox, and WebKit; these engines do not substitute for physical-device validation. Test incoming sharing separately on an installed Android Chrome PWA. Keep exact browser/device versions in verification records rather than promising universal support here.

Metadata adapters use browser `fetch` only when the provider permits it. API keys are optional deployment configuration, never prerequisites for the core release. A browser-visible API key cannot be treated as a secret; restrict any configured key to its intended API and deployment origins where supported. Do not introduce a generic public CORS proxy or undocumented scraping dependency.

Article extraction libraries such as Mozilla Readability may be added when a permitted fetch path supplies complete HTML. They do not solve access restrictions. Pasted plain text can be counted without an HTML extraction dependency. No AI SDK or inference service is needed for the planned core workflow.

## References

Official documentation reviewed November 6, 2026. Recheck package APIs and engine requirements when scaffolding.

- [React: building an app from scratch](https://react.dev/learn/build-a-react-app-from-scratch)
- [Vite guide](https://vite.dev/guide/)
- [Dexie documentation](https://dexie.org/docs)
- [Vite PWA: custom service worker](https://github.com/vite-pwa/vite-plugin-pwa/blob/main/docs/guide/inject-manifest.md)
- [Playwright service-worker testing](https://playwright.dev/docs/service-workers)
- [Playwright emulation](https://playwright.dev/docs/emulation)
