# stop-tumpuk — Reading-Plan Simplification Milestones

**Version:** 2.1

**Status:** Milestones 1–4 verified November 10, 2026; Milestone 5 and release checks remain unverified

**Product authority:** [PRD.md](PRD.md) v2.1

**Implementation design:** [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md)

**Toolchain:** [TECH_STACK.md](TECH_STACK.md)

## Reset baseline

This plan replaces the original MVP delivery checklist after the November 9, 2026 product decisions, amended by the November 10 decision to allow one prototype schema/data replacement in the upcoming pre-production Milestone 1 without old-prototype compatibility support. The existing app already contains capture, commitment, recommendations, a focus timer, notes, export/import, local persistence, and PWA support. The revised requirements have been documented; application implementation has not begun in this cycle. Documentation completion does not check off implementation deliverables.

The previous plan recorded a passing Chromium capture-to-completion flow and other automated checks for the earlier app. Those records do not verify PRD v2.1. Physical-device persistence, offline behavior, the browser matrix, and installed Android Chrome incoming sharing were still outstanding and remain explicit release gates here. Resetting the checklist does not certify those checks or erase their obligations. Git history retains the previous plan.

## Delivery order

Complete Milestone 1's data/estimation foundation before relying on the new estimate model in later features. Milestone 2 supplies destination-aware capture; Milestone 3 connects capacity, selection, and finishing; Milestone 4 reconciles action hierarchy across the app. Milestone 5 validates the integrated revision. Keep changes scoped to these deliverables and retain the chosen stack and product functionality. Types, schemas, module structure, and formats may be replaced where useful; preserving the old implementation is not a deliverable.

## Milestone 1 — New data model and estimated time

**References:** FR-03, FR-04, FR-13; SYSTEM_DESIGN persistence and schema-replacement sections.

- [x] Define the new material, note, session, settings, and estimated-time types directly; use one domain estimate calculation with explicit zero/unknown distinctions and internal duration provenance.
- [x] Replace the prototype database schema/data once in this pre-production milestone. Do not add prototype migration adapters or preserve prototype schema chains for compatibility. Record the new database identity and baseline; verify subsequent launches retain data. This permission does not extend to later production upgrades.
- [x] Define and validate the current export/import format only. Retain atomic additive import and conflict preview; reject unsupported formats before writes. Remove old-backup conversion and compatibility code if present.
- [x] Remove priority/multiplier fields and their consumers, ranking effects, defaults, badges, and edit controls; replace obsolete data structures rather than deprecating them.
- [x] Replace separate duration/total-effort inputs with one estimated-minutes correction. Keep simple provenance labels and advanced type/video-speed correction; remove technical source/completeness selectors.
- [x] Remove the pasted-content input, word-counter action, and article reading-speed setting. Retain weekday/weekend configuration in the new settings model.
- [x] Update domain/storage tests and fixtures for fresh initialization, one-time cutover, subsequent-launch persistence, override precedence, unknown/zero values, multiple notes per material, transaction rollback, unsupported imports, and current-format round trips.

**Acceptance gate:** The one-time prototype replacement is complete and its reset exception is closed. The app initializes directly into the new model, target estimates are consistent in every consumer, and removed rules have no active or compatibility paths. New-format data remains durable; old-format imports fail without changing it. Run type checking and focused estimation/storage checks before checking items above.

## Milestone 2 — Save to the chosen destination

**References:** FR-02, FR-05, FR-13.

- [x] Add the visible Reading plan/Inbox choice to capture, defaulting to Reading plan for each new capture, without adding a second confirmation step.
- [x] Pass the destination through validation, duplicate confirmation/retry, save, and optional enrichment; use accurate success/error copy.
- [x] Persist direct commitment history with Reading-plan capture in one transaction; Inbox captures remain uncommitted.
- [x] Route incoming-share candidates through the same destination-aware form; reloads/retries do not silently create extra saves or commitments.
- [x] Verify saving without metadata, estimates, installation, or availability; test both destinations, duplicate retries, storage errors, and commitment accounting.

**Acceptance gate:** The chosen destination determines status/history/backlog correctly, including duplicate and share-intake paths. Run type checking and focused capture/storage tests; use mocked provider responses.

## Milestone 3 — Capacity, one next item, and direct finishing

**References:** FR-01, FR-06 through FR-10.

- [x] Replace dashboard statistic cards with the conversational weekly-capacity view model and accessible fill visualization; preserve separate weekday/weekend allowance editing.
- [x] Cover empty, under-capacity, full, overflow, unknown-estimate, zero, and unset states. Qualify headroom/projections correctly and avoid implying completion progress or a weekly reset.
- [x] Show one deterministic fitting recommendation, with Choose another and truthful no-match/partial-session alternatives. Remove priority dependence while preserving stable ordering.
- [x] Remove the automatic takeaway prompt and its post-completion state. Finish transactionally, refresh plan/recommendation state, and leave notes accessible on demand, including from Finished items.
- [x] Retain the optional 25-minute timer, start/pause/resume/end controls, and reload recovery. Completing a timer never finishes an item or decreases its estimate.
- [x] Verify capacity calculations, recommendation ties/fitting, refresh after lifecycle changes, finish without timer/note, and independent note failures.

**Acceptance gate:** The primary screen communicates the time commitment and one useful next action. Finishing frees planned capacity immediately after a successful save, without an extra note step. Run type checking, relevant domain/storage checks, and the affected browser flow; verify text equivalents and reduced motion.

## Milestone 4 — Action hierarchy and plain language

**References:** FR-08, FR-10, FR-12.

- [x] Apply primary-action plus Advanced actions grouping to Inbox and Reading-plan rows; retain edit, notes, return, archive, and delete access as appropriate.
- [x] Simplify reading-session actions according to context while keeping Back and running timer controls directly reachable; hiding optional controls must not interrupt timer lifecycle handling.
- [x] Replace the six status-filter buttons with one labeled dropdown and retain search/filter behavior.
- [x] Keep New note prominent and move each note's Edit/Delete into an item menu; preserve existing multiple-notes-per-material support. Verify adding two notes to one material, independent editing/deletion, search, and access after finishing; retain deletion confirmation.
- [x] Separate the import-preview step from export controls without removing validation, conflict counts, Cancel, or the ability to close.
- [x] Apply the FR-12 terminology throughout capture, dashboard, reading, material lists, dialogs, errors, empty states, and accessibility labels. Update internal identifiers consistently if needed; no legacy mapping is required.
- [x] Preserve the existing closable mobile header menu; verify menu-to-dialog focus transfer, Escape/outside dismissal, keyboard selection, touch targets, and clipping at mobile/desktop widths.

**Acceptance gate:** Each affected task has an evident main action, all secondary actions remain reachable, and smaller action groups do not acquire unnecessary nesting. Run type checking and focused browser interaction checks; inspect the changed responsive layouts.

## Milestone 5 — Integrated revision and release validation

**References:** PRD section 11; FR-13, FR-14; AGENTS verification policy.

- [ ] Update the production-browser capture-to-finish flow for Reading-plan default, explicit Inbox, edited estimate, single recommendation, direct finish, and later on-demand note retrieval. Mock external metadata responses.
- [ ] Verify fresh setup and the one-time schema replacement, then reload/export/import new-format records with manual estimates, multiple notes per material, and active/paused timers. Confirm new data is not repeatedly reset and unsupported old backups cannot modify it.
- [ ] Run the revision release checks using the actual package scripts: typecheck, relevant/full unit-storage suite, lint, formatting check, production build, and production-browser tests. Record commands and actual outcomes.
- [ ] Validate production service-worker/offline access to stored material metadata, notes, and plan; verify update behavior and browser restart persistence.
- [ ] Select and record browser/OS/device versions. Validate mobile and desktop paste-to-finish, responsive capacity display, action menus, and fallback source links; distinguish automated engines from real devices.
- [ ] On a physical installed Android Chrome PWA, validate incoming URL/text shares, destination selection, and duplicate handling. Record unsupported combinations accurately; do not imply iOS/Safari incoming-share support.
- [ ] Record the first production database/schema and export-format baseline, supported released-format policy, and future migration/deprecation process from FR-13 and SYSTEM_DESIGN. Confirm the prototype reset cannot recur as a normal update or production recovery path. Do not build speculative future migrations.
- [ ] Reconcile implementation notes and remaining limitations with the source-of-truth documents. Confirm every PRD v2.1 acceptance criterion has evidence before release.

**Acceptance gate:** All revision requirements have implementation and verification evidence. Browser emulation does not satisfy native-share or physical-device gates. Failed/unrun checks stay unchecked, with the remaining limitation recorded.

## Deferred work and scope control

Refer to PRD sections 12 and 15 and FR-13 for exclusions and settled decisions. Do not add compatibility layers for the prototype discarded in Milestone 1. This exclusion does not apply to production evolution: later changes to released schemas or supported backup formats require migrations/conversions and verification under FR-13. Do not add new category/goal management, calendar scheduling, custom timer cycles, manual remaining-time tracking, rich-text notes, accounts/sync, or AI during this revision. Keep the existing product name, focus timer, weekday/weekend allowances, and local-first safeguards.

Exact physical browser/device versions must be recorded during Milestone 5. No product question already resolved by PRD v2.1 should be reopened merely because the old checklist contained it.

## Release gate

Release the simplified app only after these milestones meet their acceptance gates and PRD v2.1 section 11 is verified. Establish the released data-format baseline at that point; all subsequent production changes follow the preservation policy. Running a production build for testing does not itself make the prototype data a released compatibility contract. A planning-document update alone never completes an implementation milestone.
