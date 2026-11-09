# Repository guidance

## Read before working

Read [PRD.md](PRD.md) and [MILESTONES.md](MILESTONES.md) before planning or implementing a feature. Read [TECH_STACK.md](TECH_STACK.md) and [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) before changing architecture, dependencies, storage, or integrations.

## Sources of truth

| Document           | Owns                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| `PRD.md`           | Product requirements, behavior, scope, acceptance criteria, and product decisions |
| `MILESTONES.md`    | Delivery sequence, deliverable checklists, and release gates                      |
| `TECH_STACK.md`    | Technical choices, dependency policy, and toolchain                               |
| `SYSTEM_DESIGN.md` | Architecture, module boundaries, data flow, persistence, and failure handling     |
| `AGENTS.md`        | Instructions for contributors and coding agents                                   |

Do not create a second requirements document or copy the PRD into these technical documents. Reference FR identifiers and milestone headings instead. Technical documents explain how to deliver the product; they cannot expand or override product scope.

Follow the user's current instructions. If an authorized change alters product behavior or delivery scope, update the owning document and reconcile affected documents in the same task. If existing documents conflict, use the PRD for behavior and the milestones for sequencing, and correct the inconsistency. Raise only unresolved choices that materially affect scope, data loss, cost, or user behavior; routine implementation choices do not require confirmation.

## Current repository state

The repository contains a Milestone 1 application scaffold, package manifest, and source files. Its dependencies may not be installed in every environment, so check the actual filesystem and available toolchain before running commands or describing verified behavior. The technical documents describe the intended architecture; source code and successful checks establish implementation state.

## Implementation workflow

1. Identify the relevant PRD requirements and current milestone deliverables.
2. Inspect existing code and conventions before editing. Keep changes focused on the requested outcome.
3. Keep business rules separate from UI, storage, network providers, and service-worker code, using the boundaries in `SYSTEM_DESIGN.md`.
4. Validate the change with checks appropriate to its impact. Record what passed, what failed, and what could not run.
5. Update milestone checkboxes only when the deliverable has been implemented and verified. Partial work stays unchecked; note the remaining work beside the item when useful.
6. Update the owning technical document when a technical decision changes. Product changes belong in the PRD; scheduling changes belong in milestones.

Do not implement deferred features, scaffolding for hypothetical services, or unrelated refactors merely because they appear in future plans. Preserve open product questions as open until resolved by the user or an explicitly documented working assumption consistent with the PRD.

## Engineering conventions

- Use strict TypeScript and explicit types at persistence and provider boundaries. Validate untrusted inputs at runtime.
- Keep duration units explicit, unknown values nullable, and deterministic business rules independently testable. Follow the estimation and state rules in the PRD rather than duplicating them here.
- Persist data through the repository layer. Keep database schemas and migrations together; never reset a user's database to solve a migration problem.
- Treat fetched content, shared text, and imported files as untrusted data. Never execute remote scripts or render unsanitized HTML. Do not log private notes or full shared payloads by default.
- Treat browser capabilities as enhancements. Maintain the fallback paths specified in the PRD and report capabilities accurately.
- Keep dependency additions purposeful. Use pnpm and commit only `pnpm-lock.yaml`; do not introduce npm, Yarn, Bun, or another lockfile. Select supported versions at scaffolding time, and document the chosen Node and pnpm versions plus package scripts then.
- Use Tailwind CSS for application styling and Headless UI for accessible interactive primitives. Keep semantic HTML, keyboard interaction, focus management, contrast, and reduced-motion support intact when composing them.
- Use Prettier as the formatting authority. Run `pnpm format` only when formatting changed source, and use `pnpm format:check` when a formatting verification is warranted; do not hand-format generated or broadly reformatted files.
- Do not put secrets in frontend environment variables; bundled configuration is public. Do not add an external service as a prerequisite for core behavior.
- some tailwindcss written in old way, Use `selector-(--colorvar)` instead of `selector-[var(--colorvar)]`

## Verification

Use the scripts actually present in `package.json`. Intended scripts are listed in `TECH_STACK.md`; they do not exist yet. Do not report unrun checks as passing.

For an ordinary completed TypeScript feature, run `pnpm typecheck` as the default required verification. Do not run `pnpm build`, `pnpm test:e2e`, or Playwright automatically after every feature. Run only the narrowest additional check justified by the change: relevant unit/storage/UI tests for changed business or persistence logic; a production build for build configuration, service worker, manifest, generated assets, or deployment changes; and Playwright for an affected end-to-end flow, browser-only behavior, regression, or milestone/release validation.

Prioritize focused tests for estimation/override precedence, unknown values, backlog calculations, recommendation fitting, lifecycle transitions, migrations/import integrity, and the main capture-to-completion flow. Mock provider responses for automated tests; live platforms should not determine whether the core test suite passes.

Test service-worker/offline behavior against a production build. Browser emulation does not prove that a PWA appears in a phone's native share menu; record physical-device validation separately. Documentation-only changes need link and consistency checks, not new application tests.

## Reporting

State what changed, why it matters, which checks ran, and any remaining limitation. Link changed files. Distinguish implemented behavior from proposed design and manual testing from automated testing. Do not mark a milestone complete based on document creation alone.
