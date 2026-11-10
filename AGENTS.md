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

The repository contains the existing capture-to-completion app, optional focus timer, notes, local persistence, export/import, PWA support, and a production-browser test. PRD v2.1 specifies the accepted simplification revision; the reset milestones track its implementation, not the original scaffold. Do not treat updated documents or old completed checkboxes as evidence that the revision is implemented. Physical-device persistence, offline, browser-matrix, and installed-PWA sharing checks remain release work. Check the filesystem and installed toolchain before running commands or reporting verification.

## Implementation workflow

1. Identify the relevant PRD requirements and current milestone deliverables.
2. Inspect existing code and conventions before editing. Keep changes focused on the requested outcome.
3. Keep business rules separate from UI, storage, network providers, and service-worker code, using the boundaries in `SYSTEM_DESIGN.md`.
4. Validate the change with checks appropriate to its impact. Record what passed, what failed, and what could not run.
5. Update milestone checkboxes only when the deliverable has been implemented and verified. Partial work stays unchecked; note the remaining work beside the item when useful.
6. Update the owning technical document when a technical decision changes. Product changes belong in the PRD; scheduling changes belong in milestones.
7. Follow PRD v2.1 and the milestone sequence. Only the upcoming pre-production Milestone 1 may replace the existing schema/data directly without migration adapters, deprecated-field support, or compatibility shims for the old prototype. Update all affected consumers together and preserve retained product behavior. This exception expires after that cutover; later production changes follow the data-preserving evolution policy in FR-13 and SYSTEM_DESIGN.md.

Do not implement deferred features, scaffolding for hypothetical services, or unrelated refactors merely because they appear in future plans. Preserve open product questions as open until resolved by the user or an explicitly documented working assumption consistent with the PRD.

## Engineering conventions

- Use strict TypeScript and explicit types at persistence and provider boundaries. Validate untrusted inputs at runtime.
- Keep duration units explicit, unknown values nullable, and deterministic business rules independently testable. Follow the estimation and state rules in the PRD rather than duplicating them here.
- Persist data through the repository layer and keep schema definitions and migrations together. The user authorizes one replacement of prototype local data during the upcoming pre-production Milestone 1 only. After that cutover, retain the database identity and preserve user data; production schema changes require versioned migrations, compatibility handling for supported released formats, and upgrade tests. Never use a reset or a new empty database to recover from production migration/storage errors. Deprecate released fields/formats deliberately, with documented support and removal decisions.
- Treat fetched content, shared text, and imported files as untrusted data. Never execute remote scripts or render unsanitized HTML. Do not log private notes or full shared payloads by default.
- Treat browser capabilities as enhancements. Maintain the fallback paths specified in the PRD and report capabilities accurately.
- Keep dependency additions purposeful. Use pnpm and commit only `pnpm-lock.yaml`; do not introduce npm, Yarn, Bun, or another lockfile. Select supported versions at scaffolding time, and document the chosen Node and pnpm versions plus package scripts then.
- Use Tailwind CSS for application styling and Headless UI for accessible interactive primitives. Keep semantic HTML, keyboard interaction, focus management, contrast, and reduced-motion support intact when composing them.
- Use Prettier as the formatting authority. Run `pnpm format` only when formatting changed source, and use `pnpm format:check` when a formatting verification is warranted; do not hand-format generated or broadly reformatted files.
- Do not put secrets in frontend environment variables; bundled configuration is public. Do not add an external service as a prerequisite for core behavior.
- When changing Tailwind CSS variable utilities, use `selector-(--colorvar)` instead of `selector-[var(--colorvar)]`. Avoid unrelated styling churn.
- When coding agents are used, always include the agent co-author trailer in commits.

## Verification

Use the scripts actually present in `package.json`; `TECH_STACK.md` summarizes the existing commands. Do not report unrun checks as passing.

For an ordinary completed TypeScript feature, run `pnpm typecheck` as the default required verification. Do not run `pnpm build`, `pnpm test:e2e`, or Playwright automatically after every feature. Run only the narrowest additional check justified by the change: relevant unit/storage/UI tests for changed business or persistence logic; a production build for build configuration, service worker, manifest, generated assets, or deployment changes; and Playwright for an affected end-to-end flow, browser-only behavior, regression, or milestone/release validation.

Prioritize focused tests for estimated-time/manual-override precedence, unknown values, capacity/overflow calculations, single-item recommendation fitting, destination-aware capture, lifecycle transitions, fresh-schema initialization/current-format import integrity, and the main capture-to-finish flow. For later production changes, also verify migrations from supported released schemas, supported backup conversions, failure rollback, and existing note/material associations. Mock provider responses for automated tests; live platforms should not determine whether the core test suite passes.

Test service-worker/offline behavior against a production build. Browser emulation does not prove that a PWA appears in a phone's native share menu; record physical-device validation separately. Documentation-only changes need link and consistency checks, not new application tests.

## Reporting

State what changed, why it matters, which checks ran, and any remaining limitation. Link changed files. Distinguish implemented behavior from proposed design and manual testing from automated testing. Do not mark a milestone complete based on document creation alone.
