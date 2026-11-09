# stop-tumpuk — MVP Milestones

**Version:** 1.1  
**Status:** Proposed implementation plan  
**Related document:** `PRD.md` v1.1

## Product constraints

- Web-first responsive PWA; local-first data storage; no account required.
- Focus on individual articles and standalone videos; course management is outside MVP.
- URL paste guarantees capture; receiving shares is an installed-PWA enhancement on compatible browsers.
- Local queues do not automatically synchronize between phone and desktop.
- No paid AI dependency. Recommendations and effort estimates use deterministic rules.
- Saving to Inbox does not count as a learning commitment.
- Completion requires the user's explicit action.
- No automatic scroll tracking, playback timestamp tracking, or automatic content-completion detection.
- In-app content display only where permitted; otherwise open the source externally.

## Milestone 1 — Capture and Commitment

**Objective:** Make the time cost of committed learning visible and let users decide what to learn.

### Deliverables

- [x] PWA shell and responsive navigation.
- [x] Local IndexedDB persistence and schema migrations.
- [x] Skippable onboarding to set weekday/weekend learning availability, including zero-minute days; distinguish unset capacity.
- [x] URL paste capture into Inbox; duplicate URL warning.
- [x] PWA share target on supported browsers, with URL paste as fallback.
- [x] Save immediately, then attempt metadata enrichment; editable title, content type, and source.
- [x] Manual metadata/content-duration and optional pasted-text word-count fallback when extraction fails; no extraction server or API key required for core release.
- [x] Duration provenance and content completeness labels; never derive full duration from a paywall preview.
- [x] Separate content duration and estimated learning effort; editable effort multipliers or values.
- [x] Inbox review, edit, delete, and commit-to-queue actions.
- [x] Queue priorities and material statuses.
- [x] Dashboard: weekly capacity, committed workload, clearance estimate, and overload warning.
- [x] Clear behavior for zero weekly capacity and unknown effort.
- [x] Small-queue guidance against weekly capacity; archive stale Inbox items without counting completion.

Implementation verification: TypeScript, domain tests, formatting, linting, and the production PWA build pass. The Milestone 1 release acceptance checks still need real-browser validation of IndexedDB persistence across a restart and installed-PWA incoming sharing; no browser binary or browser-test runner is available in this environment.

### Acceptance criteria

1. A user can save and recover a URL after restarting the browser.
2. Saving to Inbox does not increase committed workload; committing does.
3. Users can override inaccurate or unavailable metadata and estimates.
4. Clearance estimate updates after changing availability, commitment, or effort.
5. No paid AI service or login is required.
6. Capture works without installation, duration entry, or availability setup; unknown effort remains visible in partial backlog totals.
7. Manual effort overrides survive metadata refreshes.

## Milestone 2 — Learning and Completion

**Objective:** Turn the committed queue into actionable learning sessions.

### Deliverables

- [ ] Deterministic recommendation engine based on priority, available time, effort, and in-progress status.
- [ ] Time-budget shortcuts and custom input; unknown effort cannot be claimed to fit, and no-match results offer manual alternatives.
- [ ] Manual selection and override of recommended material.
- [ ] Learning view with source link or supported embedded viewer.
- [ ] Optional Pomodoro timer with start, pause, resume, and end controls.
- [ ] In Progress state for materials requiring multiple sessions.
- [ ] Explicit Complete button; timer ending never marks completion.
- [ ] Optional takeaway prompt on completion, with Skip action.
- [ ] Dashboard and queue refresh when material is completed or reopened.
- [ ] Manual remaining-effort adjustment for unfinished materials (recommended; confirm before implementation).

### Acceptance criteria

1. The user can select a material, begin a focus session, and return to it later.
2. The user can open external content when embedding is blocked.
3. Completion happens only after clicking Complete.
4. Completing a material removes its remaining estimated effort from the active backlog.
5. Notes can be skipped without blocking completion.
6. No automatic scroll or video playback progress tracking is implemented.
7. Users can open and complete an item without starting a timer; recommendations use estimated learning effort rather than raw runtime.

## Milestone 3 — Knowledge Retention and Data Safety

**Objective:** Preserve takeaways with their sources and make local-first usage dependable.

### Deliverables

- [ ] Create, edit, delete, and view notes attached to materials.
- [ ] Notes available during learning and after completion.
- [ ] Material and note search/filtering.
- [ ] Export/import of materials, notes, and user settings.
- [ ] Import validation and versioned migration behavior.
- [ ] Offline access to local metadata, queue, and notes where PWA support permits.
- [ ] Clear local-data-loss messaging and responsive accessibility checks.
- [ ] End-to-end tests for capture → estimate/fallback → commit → choose by time → learn → complete, with optional takeaway and archive paths.
- [ ] Validate paste-to-completion on the chosen mobile/desktop browser matrix; separately verify incoming sharing on installed Android Chrome PWA, including URLs embedded in shared text.
- [ ] Clearly explain local device storage and the absence of automatic cross-device synchronization.

### Acceptance criteria

1. Every note retains its source-material association.
2. Users can skip a takeaway, edit it later, or archive an unwanted item without increasing completion statistics.
3. Data survives normal browser restarts and round-trips through export/import.
4. Core local data remains accessible without network access after installation/cache initialization.
5. The complete MVP acceptance criteria in `PRD.md` are satisfied.

## Future milestones — Out of MVP

- Manual note relationships and interactive Obsidian-style knowledge graph; retain stable note/material IDs in MVP.
- Optional accounts and cloud synchronization.
- Browser extension, chat-history/saved-collection imports, chat-app integrations, and native apps/share extensions.
- Long-course, curriculum, and lesson progress management.
- Optional local/edge AI for categorization, recommendations, and semantic links.
- Calendar integrations, quizzes, and advanced learning analytics.

## Decisions to resolve before implementation

1. Weekday/weekend schedule only, or seven-day customization?
2. Fixed or customizable Pomodoro focus/break cycles?
3. How should remaining learning effort be manually adjusted after sessions?
4. Categories/priorities only, or explicit learning goals?
5. Plain text, Markdown, or rich-text notes?
6. Exact mobile/desktop browser test matrix? URL paste is guaranteed; incoming sharing is an enhancement to test on installed Android Chrome PWA, with no iOS/Safari incoming-share promise.
7. Final product name?

## Release gate

Ship the MVP after all three milestones pass their acceptance criteria. Avoid adding graph visualization, cloud sync, or AI features before validating that users actually complete more of their committed learning materials.
