# stop-tumpuk

Turn useful articles and videos you discover into learning you actually finish.

stop-tumpuk is a web-first, mobile-friendly PWA for capturing learning resources, making their time cost visible, and choosing a manageable learning queue. It is local-first: no account or paid AI service is required for the core workflow.

## What works today

Milestone 1—Capture and Commitment—is implemented:

- Paste an HTTP(S) URL to save it to an Inbox, with a duplicate warning.
- Set weekday and weekend learning availability, or skip it and configure it later.
- Enrich and edit material metadata; manually set a duration or estimate article time from pasted text.
- Keep content duration separate from estimated learning effort.
- Commit selected Inbox items to a queue, set their priority, and see workload, unknown estimates, weekly capacity, and a clearance estimate.
- Archive or delete stale materials without counting them as completed.
- Receive shared links in supported installed-PWA environments; URL paste remains the guaranteed fallback.

Learning sessions, recommendations, completion, notes, export/import, and broader offline validation are planned for later milestones. See [MILESTONES.md](MILESTONES.md) for the delivery plan and [PRD.md](PRD.md) for product behavior.

## Run locally

Requirements: Node.js 22 or newer and pnpm 10 or newer. The exact engine range is in [package.json](package.json).

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite. The application stores data in the current browser profile using IndexedDB; it does not automatically synchronize between devices.

## Commands

| Command             | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| `pnpm dev`          | Start the development server.                    |
| `pnpm typecheck`    | Type-check the application and service worker.   |
| `pnpm lint`         | Run ESLint.                                      |
| `pnpm format`       | Apply Prettier formatting.                       |
| `pnpm format:check` | Check formatting without writing files.          |
| `pnpm test`         | Run the Vitest suite.                            |
| `pnpm build`        | Create the production build and service worker.  |
| `pnpm preview`      | Serve the production build locally.              |
| `pnpm test:e2e`     | Run Playwright end-to-end tests when configured. |

## Tech overview

The app uses React, TypeScript, Vite, Tailwind CSS, Headless UI, Heroicons, Dexie/IndexedDB, and `vite-plugin-pwa`. Architectural boundaries and dependency decisions are documented in [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) and [TECH_STACK.md](TECH_STACK.md).

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md) before changing the project. In particular, preserve the local-first model, keep estimation and status rules deterministic, and update the owning product or technical document when a change affects it.
