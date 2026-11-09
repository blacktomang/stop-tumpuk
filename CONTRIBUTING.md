# Contributing to stop-tumpuk

Thanks for helping make saved learning resources easier to finish.

## Before you start

Read these documents in order:

1. [AGENTS.md](AGENTS.md) for repository workflow and engineering conventions.
2. [PRD.md](PRD.md) for product behavior and acceptance criteria.
3. [MILESTONES.md](MILESTONES.md) for delivery sequence and scope.
4. [TECH_STACK.md](TECH_STACK.md) and [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) before changing architecture, dependencies, storage, or integrations.

The PRD owns product behavior; milestones own delivery scope. Do not implement deferred work unless it is explicitly in scope.

## Local setup

Use Node.js 22+ and pnpm 10+.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Use pnpm exclusively and commit only `pnpm-lock.yaml`; do not add npm, Yarn, or Bun lockfiles.

## Development guidelines

- Keep business rules independent from UI, persistence, network providers, and service-worker code.
- Use strict TypeScript and validate data at persistence and provider boundaries.
- Treat URLs, shared text, imported data, and fetched content as untrusted.
- Preserve unknown duration and effort values as unknown—never turn them into zero.
- Persist through repository-layer APIs. Keep schema migrations with the database schema and never reset a user database to solve a migration issue.
- Use Tailwind CSS and Headless UI for accessible interaction patterns. Keep keyboard support, focus management, semantic HTML, contrast, and reduced-motion support intact.
- Use the Tailwind CSS-variable shorthand, for example `hover:border-(--accent)`, rather than `hover:border-[var(--accent)]`.
- Do not add secrets to frontend configuration or make an external service necessary for the core workflow.

## Validation

Run the narrowest checks that cover your change. For a typical TypeScript feature, run:

```bash
pnpm typecheck
```

Also run targeted tests for changed business or persistence logic. Use `pnpm build` for build, PWA, manifest, generated-asset, or deployment changes; use `pnpm test:e2e` for changed end-to-end or browser-specific behavior. Run `pnpm format` after formatting source changes, and use `pnpm format:check` when verifying formatting without modifying files.

Document what you changed, why it matters, what checks passed, and any limitation that remains. Do not report checks that did not run as passing.

## Documentation and scope

Update the document that owns a decision whenever your change affects it:

| Change                                                   | Update                               |
| -------------------------------------------------------- | ------------------------------------ |
| Product behavior or scope                                | [PRD.md](PRD.md)                     |
| Delivery sequence or release criteria                    | [MILESTONES.md](MILESTONES.md)       |
| Dependencies, toolchain, or technical choices            | [TECH_STACK.md](TECH_STACK.md)       |
| Architecture, storage, integrations, or failure handling | [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) |

Only mark a milestone checklist item complete after the work is implemented and verified.
