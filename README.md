# stop-tumpuk

Turn useful articles and videos you discover into learning you actually finish.

stop-tumpuk is a web-first, mobile-friendly PWA for capturing learning resources, making their time cost visible, and choosing a manageable learning queue. It is local-first: no account or paid AI service is required for the core workflow.

## Current implementation

The implemented PRD v2.1 revision includes:

- Materials retain provider duration separately from an optional manual estimated-time correction; zero and unknown remain distinct.
- The editor exposes one estimated-minutes correction and simple estimate labels, with only type and video speed in advanced controls.
- Priority, learning multipliers, pasted-text word counting, and article reading-speed settings are removed.
- Local data now uses the `stop-tumpuk-reading-plan-v1` schema and accepts only the current `stop-tumpuk-reading-plan` export format.
- Capture defaults to Reading plan with an explicit Inbox choice; capacity, one deterministic recommendation, direct finish, on-demand notes, and the optional timer are integrated.
- Material and note secondary actions use accessible menus, and imports have a separate review step.
- The PWA asks before activating a waiting update so a reload remains user-controlled.

### Data-format baseline

The first production release will establish `stop-tumpuk-reading-plan-v1` schema version 1 and `stop-tumpuk-reading-plan` export version 1 as its retained baseline. The one-time prototype replacement is closed: later releases preserve this database identity and use versioned upgrades and documented supported-format conversions. See [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) for that process.

Automated validation is recorded in [MILESTONES.md](MILESTONES.md). Physical-device persistence/offline and installed Android Chrome incoming-share checks remain release work; no iOS/Safari incoming-share support is claimed.

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
