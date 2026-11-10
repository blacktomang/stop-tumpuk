# Product Requirements Document

## stop-tumpuk

**Version:** 2.1

**Status:** Reading-plan simplification approved November 9, 2026; one-time pre-production schema replacement clarified November 10, 2026; implementation pending

**Platform:** Web-first, mobile-friendly Progressive Web App (PWA)

**Product name:** stop-tumpuk

---

## 1. Executive Summary

stop-tumpuk is a web-based application that helps people finish useful articles and standalone videos they discover while browsing.

Users frequently encounter useful articles and videos while browsing social media, professional networks, and the web. They send links to themselves on WhatsApp, Instagram DMs, or other collections, but these become a link bank they rarely revisit. The MVP focuses on individual articles and videos, including standalone tutorials; long courses, curricula, and course progress management are outside its scope. No arbitrary duration cutoff blocks saving.

The application addresses this problem by making the time cost of learning visible.

Users can capture resources, estimate the time required to learn them, select which materials deserve their attention, choose a reading plan that fits their available time, and complete them through focused learning sessions.

Users can optionally capture a note associated with the source, on demand. Note relationships and knowledge graph features are deferred until the capture-to-completion workflow is validated.

**Positioning:** Turn useful articles and videos you discover into learning you actually finish.

**Core philosophy:**

> Saving information is not learning. Every learning commitment has a time cost.

The product should encourage meaningful progress rather than reward collecting more links.

## 2. Problem Statement

### 2.1 User problem

People save useful learning resources across LinkedIn, Instagram, YouTube, blogs, websites, and messaging applications.

Common problems include:

- Saved resources accumulate without a concrete plan.
- Users underestimate the time required to consume their backlog.
- Existing bookmarking behavior creates a false sense of progress.
- Users struggle to decide what to learn next.
- Learning sessions are disconnected from saved materials.
- Notes and takeaways become separated from their original sources.
- Users lack visibility into whether their learning commitments are realistic.

### 2.2 Product opportunity

Connect three previously separate activities:

1. Collecting educational resources.
2. Allocating limited learning time.
3. Turning completed materials into retained knowledge.

The application should make users aware of the consequences of saving additional material while helping them act on their existing commitments.

## 3. Product Goals

### Primary goals

- **G1 — Learning awareness:** Help users understand the estimated time investment represented by their committed learning backlog.
- **G2 — Actionable learning:** Recommend learning materials that fit the user's available time.
- **G3 — Deliberate completion:** Encourage users to actively complete materials rather than passively accumulate them.
- **G4 — Knowledge retention:** Allow users to preserve notes and associate them with their original learning materials.
- **G5 — Low-friction capture:** Allow users to quickly save links without requiring immediate organization.

### Non-goals

The MVP will not attempt to:

- Automatically prove that a user learned or understood something.
- Monitor user activity across external websites.
- Automatically track article scroll position or video playback position.
- Automatically generate summaries or quizzes.
- Replace full-featured note-taking applications.
- Build a social learning network.
- Manage long courses, lesson sequences, or curricula.
- Automatically import WhatsApp messages, Instagram DMs, or existing saved collections.
- Require comprehensive metadata extraction or native app installation to use the core workflow.
- Require paid AI inference.

## 4. Target Users

### Primary persona

A person who frequently discovers useful articles and standalone videos on their phone, saves links for later, and struggles to return to them. Developers and career-focused professionals are examples, rather than the only target audience.

**Characteristics:**

- Regularly saves articles and standalone videos through messages, DMs, and bookmarks.
- Has limited learning time due to work or personal responsibilities.
- Wants to improve skills independently.
- Often struggles with a growing backlog of saved resources.
- Values practical learning and personal knowledge management.

### Primary jobs to be done

- **JTBD-01:** When I discover a useful resource, I want to save it quickly so I can return to it later.
- **JTBD-02:** When I review my learning backlog, I want to know how much time it will require so I can make realistic commitments.
- **JTBD-03:** When I have limited free time, I want to know what I should learn next.
- **JTBD-04:** When I finish something, I want to close the loop and optionally preserve a takeaway with its source.

## 5. Core Product Model

The application separates collecting from committing.

### 5.0 Primary user journey

1. **Save with intent:** paste a URL or receive a supported share. Choose Reading plan (default) or Inbox directly in the capture form; no extra confirmation dialog or required setup.
2. **See the time needed:** show an estimated time with a simple provenance label and optional correction in minutes.
3. **Allocate time:** retain separate weekday/weekend allowances. Show the reading plan against one week's available time using a capacity bar and a short explanatory sentence.
4. **Read next:** enter time available now and see one fitting recommendation, with an option to choose another item.
5. **Finish deliberately:** explicitly finish the item and update the plan immediately. Notes are available on demand before or after finishing.

### 5.1 Inbox

Inbox is an explicit choice for undecided links. It does not increase committed reading time. Users can review, edit, delete, archive, or move Inbox items into their Reading plan. Keep the Inbox count and review access visible without presenting saving as achievement.

### 5.2 Reading plan

Reading plan is the user-facing name for the committed queue and includes articles and standalone videos. Choosing it when saving is an explicit commitment, even though it is preselected. Each item has a title, source link, nullable estimated time, and lifecycle status. There are no material priority levels or learning multipliers. Encourage a manageable plan without hard item limits.

### 5.3 Reading sessions

Users can open an item and optionally use the existing 25-minute focus timer, with start, pause, resume, and end controls. Opening and finishing an item never require a timer. Timer completion neither finishes an item nor reduces its estimated time. Keep notes accessible on demand. Custom timer cycles remain deferred.

### 5.4 Notes

Each material can have multiple independent source-linked notes, created whenever useful before or after finishing. Finishing never opens a takeaway prompt. Keep stable note and material IDs within the new data model; note relationships remain deferred.

## 6. Functional Requirements

### FR-01 — Learning Availability

**Priority: P0**

Offer learning-time configuration during onboarding and allow users to skip it until planning commitments; after skipping, do not prompt again for three months and clearly state that timing. Users can edit availability at any time; retain different weekday and weekend allocations; calculate weekly capacity; permit zero-minute days. Distinguish unset capacity from zero capacity and show no clearance estimate for either. Weekday/weekend configuration is retained by decision; seven-day scheduling remains deferred.

### FR-02 — Capture Learning Resources

**Priority: P0**

Paste and validate an HTTP(S) URL; choose Reading plan (default) or Inbox in the capture form; warn about duplicates; support PWA share target where supported. Keep the destination visible before Save and briefly explain that Reading plan adds the item to estimated reading time. Default to Reading plan for each new capture; do not silently reuse a prior Inbox choice. Saving requires neither a title nor a duration, category, availability setup, or second commitment step. If no title is available, show a domain/URL placeholder. Saving to Reading plan records the commitment as part of the same durable save.

Receiving shares requires an installed PWA and compatible browser/OS; it cannot be promised on every phone. Parse URLs from shared text as well as the URL field. Present incoming shares in the same capture form so users can select the destination before saving. URL paste is the guaranteed fallback on mobile and desktop, without installation. Importing chat histories or saved collections remains deferred.

### FR-03 — Resource Metadata

**Priority: P0**

Save first, then attempt title, URL, type, domain, optional thumbnail, and source duration asynchronously using permitted metadata or public APIs. Permit manual correction and fallback; no AI or extraction server is required.

- Preserve duration provenance internally: API runtime, publisher estimate, calculated word count, manual input, or unknown, with full/partial/unknown completeness where applicable.
- Show simple labels such as “Estimated,” “Video runtime,” “Manually set,” or “Time not estimated yet.” Users do not select technical provenance or completeness values.
- YouTube: prefer official runtime when configured and accessible. Live/upcoming videos remain unknown until a final duration is available. API availability and quota never block saving.
- Medium/Substack: use an accessible publisher estimate or permitted complete article text. RSS previews do not establish full duration, and a duration field is not guaranteed.
- LinkedIn: public metadata is best effort; do not require restricted API access. Allow saving an externally linked article's original URL.
- Remove the pasted-content textarea and word-counter action. Manual estimated minutes are the fallback when extraction is unavailable. Automatic provider estimates may still be calculated from complete accessible content; no retired fields are required for legacy compatibility.
- A paywall preview, login page, or description cannot establish full-article duration. Mark unavailable estimates as unknown.
- Browser fetches respect CORS, authentication, and paywalls. Universal extraction is not promised.

### FR-04 — Estimated Time

**Priority: P0**

Expose one editable **Estimated time (minutes)** field. Internally preserve the underlying source duration and nullable manual override separately so metadata refreshes cannot replace a user's correction.

- A manual estimated-time override takes precedence; zero is a valid explicit value and differs from unknown. Clearing the override returns to the available source-based estimate, or unknown if no usable source exists.
- For articles, use a publisher estimate or a calculated duration from complete accessible text. Automatic word-based calculation, if available, uses a fixed planning assumption of 250 WPM and language-aware counting; there is no user-facing reading-speed setting or pasted-text workflow. Do not claim a whitespace counter works for every writing system.
- For videos, preserve original runtime. The existing playback-speed preference may remain under advanced editing, defaulting to 1×; estimate consumption time as runtime divided by that preference. This is distinct from the removed article reading-speed setting and is not playback tracking.
- Remove learning multipliers from settings, editing, calculations, and recommendation fitting. Do not expose separate content-duration and total-effort inputs.
- Preserve unknown values as unknown. Label estimates as planning assumptions rather than proof of understanding.
- Define the new estimated-time structure directly. Do not retain old total-effort, multiplier, priority, or reading-speed fields for compatibility, or convert pre-revision records. Once saved in the new model, manual corrections must survive normal reloads, metadata refreshes, and supported export/import.

Use a fixed estimate until explicit completion. Manual remaining-time tracking and automatic subtraction of timer time are outside this revision.

### FR-05 — Learning Commitment

**Priority: P0**

Saving to Reading plan or moving an Inbox item into it expresses commitment. Only queued/in-progress items contribute to planned time and recommendations. Unknown time does not block commitment and stays visibly unestimated. Users can return items to Inbox, archive them, or delete them. Encourage a small plan that fits available time, without hard limits or mandatory calendar scheduling.

### FR-06 — Time-Budget Awareness

**Priority: P0**

Replace the four dashboard statistic cards with one conversational time-budget message and a weekly-capacity bar. Compare known estimated time of all unfinished Reading plan items with the configured weekly allowance (`weekday minutes × 5 + weekend minutes × 2`). This is a comparison with one week's capacity, not a dated weekly schedule or a record of minutes already spent.

- Example: “You've planned 90 minutes of reading,” a bar labeled “90 of 150 minutes available this week,” and “You have room for about another hour.”
- The bar fills as planned time approaches capacity and empties as items are finished, archived, or returned to Inbox. It is not a completion-progress indicator and does not reset at the start of a week.
- When over capacity, visually cap the fill while stating the true ratio and excess: “180 / 150 minutes — 30 minutes beyond your weekly allowance.” Never hide overflow or block saving.
- With unknown estimates, say “90 minutes estimated + 3 items without estimates.” The fill and any headroom refer only to estimated items; do not suggest the whole plan fits.
- For unset availability, invite users to set weekday/weekend time without a percentage or clearance projection. For zero capacity, state that no time is allocated and avoid division by zero; do not misrepresent unset or zero as a normal empty meter.
- An optional supporting projection uses known planned time divided by weekly allowance, in plain language such as “About 2 weeks at your current schedule.” State the assumptions: no new items and following the allowance; qualify unknown items separately.
- Include a text equivalent, an accessible meter label/value, non-color overflow cues, and reduced-motion behavior.

### FR-07 — Read Next

**Priority: P0**

Ask how much time is available now, with 5/15/30-minute shortcuts and custom minutes. Show one fitting recommendation. Among active items with known estimated time within the budget, prefer in-progress items, then shorter estimated time, then older creation time and a stable ID tie-breaker. Material priority levels are removed. Use the same estimated-time calculation as editing and the capacity display.

Offer “Choose another” for manual selection. Unknown estimates can be selected manually but never claimed to fit. If nothing fits, say so and optionally suggest one longer item for a partial session or direct users to Inbox review. Do not show a competing list of recommendations beside the primary suggestion. AI is not required.

### FR-08 — Reading Mode

**Priority: P0**

Open the source; show title and estimated time; retain the optional fixed 25-minute focus timer with start, pause, resume, and end controls; provide notes on demand and explicit completion. Use an allowed embedded viewer where available, otherwise an external link. Keep the item easy to return to. No automatic scroll, playback, reading-position, or completion tracking.

Apply FR-12's action grouping. Open source is primary before reading; finishing becomes the main action when the user returns to finish. Keep navigation and active timer pause/end controls directly reachable rather than hiding a running timer's controls.

### FR-09 — Completion

**Priority: P0**

Only an explicit finish action marks an item finished. Persist completion, update the plan and next recommendation, and remove its estimated time from the active total immediately after a successful save. Do not open a takeaway/note prompt or require a Skip step. Users can add or edit notes later through the item, including from the Finished list. Failed completion remains visibly unfinished and retryable; later note failure does not undo completion.

### FR-10 — Notes

**Priority: P0**

Each material can have zero, one, or multiple notes. New note adds an independent entry rather than replacing an existing note. Create, edit, view, search, and delete these notes individually, with a unique ID, content, associated material, and created/modified dates per note. Editing or deleting one note must not change sibling notes. Notes are plain text in the current release, created on demand before or after finishing and accessed from the item or Finished list. Preserve every new-format note and its material association across normal reloads and current-format export/import. The schema-replacement policy in FR-13 applies to pre-revision data. Richer formats remain deferred.

### FR-11 — Note Relationships

**Priority: Deferred — outside MVP**

Future support may allow manually linking and unlinking notes and navigating relationships. Preserve stable IDs now; relationship UI, relationship storage, and interactive graphs are not release requirements.

### FR-12 — Material Management and Action Hierarchy

**Priority: P0**

Search and filter by status; edit title, source link, and estimated minutes; move between Inbox and Reading plan; reopen finished items; archive or delete. Type correction and the existing video playback-speed preference can be advanced editing options. Store provenance/completeness internally and display simple labels rather than technical selectors. Remove priority controls and badges. Do not introduce category or goal management in this simplification pass.

When a task's action group has more than three controls, show its main action and an accessible, closable **Advanced actions** control for secondary actions. Apply the rule per item/task, not by counting unrelated buttons across an entire page. Preserve keyboard access, focus restoration, Escape/outside dismissal, destructive-action confirmation, and a clear way to cancel or close.

- Inbox item: Commit is primary; Edit, Notes, Archive, and Delete belong in Advanced actions.
- Reading-plan item: Open source is primary; Edit, Notes, Return to Inbox, Archive, and Delete belong in Advanced actions.
- Reading session: apply the contextual main action from FR-08; group optional setup and notes. Keep running timer controls and Back reachable.
- Status filtering: replace the six-button strip with one labeled Status dropdown; filters are not advanced actions.
- Notes: keep New note prominent and place each note's Edit/Delete actions in a compact item menu to reduce repetition.
- Import preview: focus on Import new records and Cancel; place export outside that step. Keep import validation and conflict preview.
- Completed/archived rows and two-action form footers need no extra menu merely for consistency. Keep mobile header navigation in its closable hamburger menu.

Use **Reading plan**, **Estimated time**, **Time available this week**, **Read next**, and **Finished** in user-facing copy. Internal lifecycle names and data structures may be replaced if useful; keep the product behavior consistent. “Reading” includes supported standalone videos; source-opening labels may say Watch when helpful.

### FR-13 — Local-First Data Storage

**Priority: P0**

No registration or core cloud backend. Retain local IndexedDB storage, current-format export/import, and browser-data-loss guidance. Only the upcoming pre-production Milestone 1 may replace the entire prototype schema and discard incompatible prototype data if needed. That one cutover does not require migration, old-prototype backup import, deprecated fields, or backward compatibility. The exception expires after that milestone; it never applies to production user data, later releases, normal launches, or recoverable errors.

Validate the current export format and reject unsupported formats clearly before writing anything. Current-format imports remain atomic and additive with conflict preview; they must not silently overwrite or erase current records. Data created in the new model must survive normal browser restarts and supported export/import, including multiple notes per material and timer state.

After the cutover, evolve stored data without loss. Production releases must use versioned, tested migrations from supported released schemas; preserve materials, multiple notes and their associations, estimates, settings, sessions, and history. A failed upgrade must leave data recoverable rather than silently clearing it. Version backup formats independently, support documented released formats through validated conversions when needed, and communicate deprecation before removing supported behavior. Unsupported files must fail before writes. The first production release establishes the supported schema/export baseline; it does not restore support for discarded prototype formats. Record the support policy and any planned retirement with each affected release.

Data belongs to the current browser profile and origin. Installation does not provide cross-device sync: saving on a phone does not populate a laptop queue. State this clearly; export/import provides manual transfer rather than automatic synchronization.

### FR-14 — Offline Support

**Priority: P1**

PWA should provide offline access to stored metadata, queue, and notes. Offline external articles/videos are not guaranteed.

## 7. Material Status Model

**Inbox:** saved, not committed. **Queued:** committed, not started. **In Progress:** started. **Completed:** explicitly confirmed. **Archived:** removed from active workflow without completion. Completed may be reopened; archived items do not count toward backlog.

## 8. Dashboard Requirements

Lead with the FR-06 capacity visualization and its explanation, followed by the single FR-07 next item. Keep capture easy to reach without making accumulating links the main achievement. Show Inbox review access and Reading plan management as secondary content. Notes and optional timer controls belong with the selected item. The main message should connect the time links need with time the user has allocated.

Do not create a second completion-progress bar, streaks, or elapsed-time accounting in this revision. Finishing frees planned capacity; archiving also frees capacity but is never counted as completion.

## 9. Non-Functional Requirements

- **Performance:** responsive on mobile and desktop; saving not blocked by metadata extraction; recommendations computed locally.
- **Accessibility:** keyboard access, timer controls, contrast, reduced motion.
- **Privacy:** no account, third-party analytics, paid AI, or unrelated activity monitoring required.
- **Reliability:** metadata failure does not block save; durable note storage; timer interruptions do not complete materials; validate imports.
- **Cost:** core MVP deployable as low-cost static web app; optional backend later.

## 10. Success Metrics

**Primary metric:** committed material completion rate = completed committed materials / total materials committed during a defined cohort period.

**Supporting metrics:** weekly completions; users completing at least one material; completed materials with notes; average backlog; clearance estimate; users returning to existing commitments. Compute locally initially.

**Hypothesis:** capacity awareness plus actionable recommendations increases completion compared with conventional bookmarking. Requires user testing.

## 11. Revision Acceptance Criteria

1. Configure separate weekday/weekend allowances; skip for three months; distinguish unset from zero.
2. Save to Reading plan by default or choose Inbox directly in the capture form, including incoming-share intake; duplicate confirmation retains the chosen destination.
3. Save without installation, metadata, duration, or availability setup; failed enrichment never loses the item.
4. Reading-plan saves and later commitments update planned time and lifecycle history once; Inbox saves remain outside the commitment.
5. Edit one estimated-time value in minutes, preserving new-format manual corrections across enrichment, normal reloads, and current-format imports.
6. Remove priority levels, multipliers, pasted-content counting, and the article reading-speed setting from the UI and active rules.
7. Preserve source provenance internally with simple visible labels; previews never establish full duration and unknown never becomes zero.
8. Show an accessible weekly-capacity bar and message, including under-capacity, full, overflow, unknown, zero, unset, and empty states.
9. Display exactly one fitting recommendation or a truthful no-match state, with manual selection available and deterministic ranking without priority.
10. Open and finish an item without starting a timer or writing a note. Keep the optional timer functional; timer completion never finishes an item.
11. Finishing immediately refreshes the plan and recommendations without a takeaway prompt; multiple independent notes remain accessible before and after finishing. Adding, editing, or deleting one note does not overwrite or remove another.
12. Reopen, return to Inbox, archive, and delete work without confusing removal with completion.
13. Apply FR-12's action grouping and plain terminology on mobile and desktop; keep essential navigation, cancellation, and active timer controls accessible.
14. During the upcoming pre-production Milestone 1 only, initialize the new data model directly, replacing incompatible prototype data if needed without migration or compatibility support. Preserve new-format materials, manual estimates, multiple notes, sessions, settings, and history through normal reloads and validated current-format export/import; reject unsupported backups without modifying current data.
15. Stored local metadata, notes, and the plan survive normal browser restarts and remain available offline after app-cache initialization; external content is not guaranteed offline.
16. Keep URL paste and external-link fallbacks, no account/paid AI prerequisite, local-data-loss guidance, and explicit absence of automatic device synchronization.
17. Validate physical-device persistence/offline behavior and installed Android Chrome incoming sharing separately from browser automation.

## 12. Explicitly Deferred Features

- **Cloud:** accounts, sync, conflict resolution.
- **Knowledge relationships:** manual note links, relationship browsing, Obsidian-style graph, auto-link suggestions.
- **Optional local/edge AI:** classification, effort recommendations, semantic search, links, summaries.
- **Capture:** extension, messaging integrations, native share integrations, batch imports.
- **Learning:** calendar, adaptive plans, reminders, streaks, quizzes, custom timer cycles, and manual remaining-time tracking.
- **Organization:** new category management and formal goals.
- **Notes:** Markdown/rich-text editing.
- **Courses:** curricula, playlists as multi-lesson courses, course enrollment, and lesson progress tracking.

Removed from this revision: material priority levels, learning multipliers, pasted-content word counting, configurable article reading speed, and automatic takeaway prompts. Migration and compatibility for the discarded prototype are excluded only from the upcoming pre-production Milestone 1. Data-preserving production migrations and supported released-backup conversions remain required by FR-13 when those formats evolve.

## 13. Recommended Implementation Approach

These are recommendations, not confirmed requirements.

Implementation choices are recorded in [TECH_STACK.md](TECH_STACK.md) and architecture in [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md). Contributor workflow is defined in [AGENTS.md](AGENTS.md). These supporting documents do not override this PRD's requirements or the delivery scope in [MILESTONES.md](MILESTONES.md).

- **Frontend:** TypeScript with lightweight framework.
- **App:** responsive PWA with layouts designed for phone capture and desktop learning; HTTPS deployment. Use normal browser navigation for the guaranteed workflow and installation only for enhanced capabilities.
- **Storage:** IndexedDB with persistence abstraction.
- **Metadata:** client-side where permitted, manual estimated-minutes fallback; optional future extraction backend. The core release remains static and must pass acceptance without an extraction server or API key. A future extraction service would receive submitted URLs and needs an explicit privacy and operating-cost decision.
- **Recommendation:** separate deterministic scoring module.
- **Estimation:** deterministic FR-04 rules with one manual correction.
- **Notes:** plain text with stable IDs and a source-material association. Notes are on demand; richer formats and note relationships are deferred.
- **AI:** no SDK, provider scaffolding, or inference dependency in the core workflow.

Keep storage, UI, estimation, and recommendations decoupled.

## 14. Risks and Constraints

- **R1 Metadata restrictions:** authenticated or cross-origin sites may block extraction; use manual fallback.
- **R2 PWA sharing:** inconsistent OS/browser support; URL paste fallback.
- **R3 Embedding:** external sites may block frames; open externally.
- **R4 Effort uncertainty:** estimates subjective; label and allow overrides.
- **R5 Local data loss:** clearing browser data can erase storage; export/import and warning.
- **R6 Workflow friction:** too many steps discourage use; streamline saving and commitment.
- **R7 Separate device queues:** local-first storage does not synchronize phone and desktop. Validate whether this limitation prevents users from returning to their links before expanding scope.
- **R8 Link-bank repetition:** capture alone may reproduce the original problem. Prioritize Inbox review, a manageable commitment queue, time-based selection, and explicit completion.

## 15. Decisions and Remaining Open Questions

Approved November 9, 2026: Reading plan defaults with an Inbox alternative; removal of priority levels, multipliers, pasted-content counting, and article reading-speed controls; retention of weekday/weekend allowances and the optional focus timer; one next recommendation; notes on demand; FR-06's capacity visualization; and FR-12's interface wording and action hierarchy. The initial notes format stays plain text. The remaining-time control was explicitly deferred earlier the same day.

The capacity bar measures unfinished commitments against a typical week's allowance, not time already spent or completion progress. For records created in the new model, underlying duration data and explicit manual corrections are protected as specified in FR-04.

Clarified November 10, 2026: the upcoming pre-production Milestone 1 may replace prototype code/data structures directly without old-prototype migration, backward compatibility, or deprecation support. At that cutover, export/import supports only the new format. This exception is not a permanent policy: later production changes preserve user data through versioned migrations, tested recovery, and documented compatibility/deprecation handling under FR-13. Multiple notes per material and normal persistence remain required throughout the new model's lifetime.

Remaining release choice: the exact physical browser/OS versions for validation. Cover the guaranteed paste-to-finish workflow on mobile and desktop and test installed Android Chrome incoming sharing separately. Do not promise iOS/Safari incoming shares. Retain the current product name and identity unless a later task changes them; do not reopen settled scope choices while implementing this revision.

## 16. Product Principles

1. **Collection is not achievement.** Do not reward saving more.
2. **Time is the real cost.** Make commitments visible.
3. **Learning is intentional.** Explicitly commit.
4. **Completion is deliberate.** Never infer from timers or browsing.
5. **Knowledge remains useful.** Preserve source links.
6. **Users remain in control.** Recommendations are optional.
7. **Low cost by default.** No paid AI requirement.
8. **Reduce friction.** Do not make productivity management a burden.

---

## 17. Web Feasibility References

Documentation reviewed November 6, 2026; these establish capability, not completed integration testing. Recheck browser support before implementation and release.

- [MDN: PWA share_target](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target): receiving shares requires installation and has limited browser support. This differs from the outgoing Web Share API.
- [Chrome: receiving shared data](https://developer.chrome.com/docs/capabilities/web-apis/web-share-target): manifest registration and shared URL/text handling.
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS): browser restrictions on reading cross-origin responses.
- [YouTube video resource](https://developers.google.com/youtube/data/reference/rest/v3/videos): official runtime in contentDetails.duration.
- [Medium read time](https://help.medium.com/hc/en-us/articles/214991667-Read-time) and [RSS feeds](https://help.medium.com/hc/en-us/articles/214874118-Using-RSS-feeds-of-profiles-publications-and-topics): publisher reading-time method and paywall limitations.
- [Substack RSS](https://support.substack.com/hc/en-us/articles/360038239391-Is-there-an-RSS-feed-for-my-publication): publication feed discovery; does not guarantee a duration field or full text for every saved item.
- [LinkedIn Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api): restricted reading permissions; arbitrary saved-link extraction is not guaranteed.

**End of PRD v2.1**
