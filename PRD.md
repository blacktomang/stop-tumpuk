# Product Requirements Document

## stop-tumpuk

**Version:** 1.1  
**Status:** MVP scope defined; implementation decisions pending  
**Platform:** Web-first, mobile-friendly Progressive Web App (PWA)  
**Product name:** stop-tumpuk

---

## 1. Executive Summary

stop-tumpuk is a web-based application that helps people finish useful articles and standalone videos they discover while browsing.

Users frequently encounter useful articles and videos while browsing social media, professional networks, and the web. They send links to themselves on WhatsApp, Instagram DMs, or other collections, but these become a link bank they rarely revisit. The MVP focuses on individual articles and videos, including standalone tutorials; long courses, curricula, and course progress management are outside its scope. No arbitrary duration cutoff blocks saving.

The application addresses this problem by making the time cost of learning visible.

Users can capture resources, estimate the time required to learn them, select which materials deserve their attention, organize them into a prioritized learning queue, and complete them through focused learning sessions.

Users can optionally capture a short takeaway associated with the source. Note relationships and knowledge graph features are deferred until the capture-to-completion workflow is validated.

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
- **G2 — Actionable learning:** Recommend learning materials that fit the user's available time and priorities.
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

1. **Capture quickly:** paste a URL, or share to the installed PWA where supported. Save immediately without requiring metadata, organization, or availability setup.
2. **See the time cost:** show available read/watch duration and estimated learning effort, with source labels and manual correction.
3. **Choose a small commitment:** review the Inbox and select a manageable queue against weekly capacity. Encourage starting with a few items; never impose a hard item limit.
4. **Start with available time:** enter a time budget such as 15 minutes and choose a fitting item by effort and priority.
5. **Close the loop:** explicitly mark finished, optionally write a takeaway, or archive an item that is no longer useful.

### 5.1 Inbox

The Inbox contains resources that users have saved but have not yet committed to learning. Saving to the Inbox does not increase the committed learning backlog. Users can review, edit, delete, or move Inbox resources into the Learning Queue.

### 5.2 Learning Queue

The Learning Queue contains resources that users have intentionally committed to learning. These resources contribute to the estimated backlog workload.

Each committed resource has:

- Estimated content duration, when available.
- Estimated learning effort.
- Priority.
- Learning status.
- Optional category or learning goal.

### 5.3 Learning Sessions

Users select a material and start a focus session. A session provides:

- A link or viewer for the material.
- An optional Pomodoro-style timer.
- Pause, resume, and end controls.
- Access to material notes.
- An explicit Complete action.

Opening and finishing material must work without starting a timer. Timer completion does not automatically mark the material as completed.

### 5.4 Notes

Users can create lightweight notes associated with a specific learning material, during learning or when completing it. A short takeaway is sufficient; notes are never required for completion. Use stable note and material IDs so relationships can be added later.

## 6. Functional Requirements

### FR-01 — Learning Availability

**Priority: P0**

Offer learning-time configuration during onboarding and allow users to skip it until planning commitments; after skipping, do not prompt again for three months and clearly state that timing. Users can edit availability at any time; support different weekday and weekend allocations; calculate weekly capacity; permit zero-minute days. Distinguish unset capacity from zero capacity and show no clearance estimate for either. **Recommended default:** weekday/weekend configuration, with per-day scheduling deferred.

### FR-02 — Capture Learning Resources

**Priority: P0**

Paste and validate an HTTP(S) URL into Inbox; edit title; warn about duplicates; support PWA share target where supported. URL paste is the guaranteed fallback on mobile and desktop. Capture must not require title editing, a duration, categories, a commitment, or schedule setup. If no title is available, show a domain/URL placeholder.

Receiving shares requires an installed PWA and compatible browser/OS; it cannot be promised on every phone. Parse URLs from shared text as well as the URL field. Ordinary browser use must work without installation. Importing existing chat histories or saved collections is deferred.

### FR-03 — Resource Metadata

**Priority: P0**

Attempt title, URL, type, domain, optional thumbnail, content duration, and learning effort. Save first, then enrich asynchronously using accessible metadata or public APIs. Permit manual correction and fallback. No AI dependency for the core workflow.

- Store the duration source: API runtime, publisher reading estimate, calculated word count, or manual input; record content completeness as full, partial, or unknown where applicable.
- YouTube: prefer official API runtime when configured and accessible; API availability and quota are not prerequisites for saving. Live or upcoming videos have no final duration until known.
- Medium/Substack: use a publisher reading estimate when accessible, or calculate from complete accessible article text. RSS can be a fallback but may omit an older item or provide only a preview. Do not assume a guaranteed duration field on either platform.
- LinkedIn: public metadata is best effort; do not require restricted API access. For externally shared articles, let users save the original destination URL.
- Offer optional pasted article text for local word counting when extraction is unavailable. It need not be retained after calculation.
- A paywall preview, login page, or description is insufficient to estimate the full material by word count. Mark unavailable estimates as unknown and permit manual entry.
- Client-side fetches must respect CORS. A PWA/service worker does not bypass CORS, authentication, or paywalls. Universal URL extraction is not an MVP promise.

### FR-04 — Learning Effort Estimation

**Priority: P0**

Represent **content duration** separately from **learning effort**. Use these deterministic rules:

- Article reading duration: a publisher estimate, or `word count / configured words per minute` from complete text. Suggested app default: 250 WPM, configurable and presented as a planning assumption. Word counting must account for the content language; a whitespace-based counter must not claim reliable estimates for every writing system.
- Video consumption time: `runtime / user-selected playback speed`, default 1.0×. Preserve the original runtime separately; selecting speed is a planning preference and does not require playback tracking.
- Learning effort: `consumption time × multiplier`; suggested light consumption 1.0×, focused study 1.5×, study with practice 2.0×. These are adjustable heuristics, not measurements of understanding.
- Users can manually enter content duration or total learning effort. A total-effort override takes precedence and must survive automatic metadata refreshes. Unknown values must remain unknown rather than become zero.

Label publisher reading time and calculated learning effort as estimates, even if video runtime came from an official API. A verified runtime does not verify the time needed to understand the material.

### FR-05 — Learning Commitment

**Priority: P0**

Users explicitly move Inbox items into Learning Queue. Commitment adds known estimated effort to backlog and enables recommendations. Encourage a small queue that fits weekly capacity, without hard item limits or mandatory weekly scheduling. Users can return items to Inbox, archive them as no longer useful, or remove them. Unknown effort does not block commitment and remains visibly unestimated.

### FR-06 — Backlog Awareness

**Priority: P0**

Show committed count, total known estimated remaining effort, number of items with unknown effort, weekly capacity, and clearance estimate (`remaining effort / weekly capacity`). Assume no new materials and adherence to schedule. Show no estimate for zero or unset capacity. If any active effort is unknown, label totals as partial and show a clearance estimate for estimated items only, never for the whole queue. Example: "4 hours estimated + 3 items without estimates." Warn when backlog exceeds a recommended threshold; never block saving.

### FR-07 — Learning Recommendations

**Priority: P0**

Let users enter the time available now, with shortcuts such as 5, 15, and 30 minutes plus a custom value. Use deterministic rules considering priority, remaining estimated learning effort, available time, optional categories, and in-progress status. Fit uses learning effort rather than raw video runtime. Return a next item or a small list and allow manual override. Items with unknown effort can be selected manually but cannot be claimed to fit. If nothing fits, offer a longer item for a partial session or Inbox review; do not fabricate a match. AI is not required.

### FR-08 — Learning Mode

**Priority: P0**

Open material; show title and effort; optionally start, pause, or end focus timer; access notes; manually Complete. Use in-app viewer where supported, otherwise external link. Keep the item easy to return to when the source opens externally. **Exclude** automatic scroll, playback, reading-position, and completion tracking. Timer is not proof of learning and is never required to finish an item.

### FR-09 — Completion

**Priority: P0**

Only the explicit Complete action marks material complete. Prompt for optional takeaway note, allow Skip, update status and statistics, and remove remaining estimated effort from active backlog.

### FR-10 — Notes

**Priority: P0**

Create, edit, view, and delete notes with unique ID, content, associated material, created/modified dates. Notes can be made before or after completion and accessed from material detail.

### FR-11 — Note Relationships

**Priority: Deferred — outside MVP**

Future support may allow manually linking and unlinking notes and navigating relationships. Preserve stable IDs now; relationship UI, relationship storage, and interactive graphs are not release requirements.

### FR-12 — Material Management

**Priority: P0**

Search and filter by status; edit metadata, priority, categories; move between Inbox and queue; reopen completed materials; delete.

### FR-13 — Local-First Data Storage

**Priority: P0**

No registration or core cloud backend. Use IndexedDB or equivalent local browser storage. **Recommended safeguards:** export/import, browser-data-loss warning, versioned migrations.

Data belongs to the current browser profile and origin. Installation does not provide cross-device sync: saving on a phone does not populate a laptop queue. State this clearly; export/import provides manual transfer rather than automatic synchronization.

### FR-14 — Offline Support

**Priority: P1**

PWA should provide offline access to stored metadata, queue, and notes. Offline external articles/videos are not guaranteed.

## 7. Material Status Model

**Inbox:** saved, not committed. **Queued:** committed, not started. **In Progress:** started. **Completed:** explicitly confirmed. **Archived:** removed from active workflow without completion. Completed may be reopened; archived items do not count toward backlog.

## 8. Dashboard Requirements

Prioritize action over collection. **Today:** "How much time do you have?", next recommendation, Start Learning. **Learning queue overview:** known effort, unknown-effort count, capacity, clearance estimate, warning. **Progress:** completed and in-progress counts, optional recent activity. **Inbox:** uncommitted count and review access, including archive/delete actions so stale links do not become a second link bank. Never celebrate saving links as achievement or count archiving as completion.

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

## 11. MVP Acceptance Criteria

1. Configure learning availability.
2. Save URL to Inbox.
3. Store metadata and estimated effort with manual fallback.
4. Commit to Learning Queue.
5. Display capacity and clearance estimate.
6. Recommend using deterministic rules.
7. Launch focus session and access material.
8. Complete manually.
9. Offer optional takeaway.
10. Keep notes attached to materials.
11. Review Inbox and return, archive, or delete materials without counting them as completed.
12. Preserve data through normal browser restarts.
13. Operate without paid AI.
14. Gracefully handle unsupported sharing and embedding.
15. Save without installation, metadata, duration entry, or schedule setup; use paste when receiving shares is unsupported.
16. Enter available time and receive a fitting recommendation by estimated effort, or a clear no-match result. Unknown effort is never presented as a confirmed fit.
17. Distinguish runtime, publisher reading estimates, calculated effort, and manual overrides. Overrides survive metadata refreshes; previews are not treated as full content.
18. Display partial backlog totals and unknown-effort counts without treating unknown as zero.
19. Complete an item without starting a timer or writing a note.
20. Explain that local queues do not automatically synchronize between phone and desktop.

## 12. Explicitly Deferred Features

- **Cloud:** accounts, sync, conflict resolution.
- **Knowledge relationships:** manual note links, relationship browsing, Obsidian-style graph, auto-link suggestions.
- **Optional local/edge AI:** classification, effort recommendations, semantic search, links, summaries.
- **Capture:** extension, messaging integrations, native share integrations, batch imports.
- **Learning:** calendar, adaptive plans, reminders, streaks, quizzes.
- **Courses:** curricula, playlists as multi-lesson courses, course enrollment, and lesson progress tracking.

## 13. Recommended Implementation Approach

These are recommendations, not confirmed requirements.

Implementation choices are recorded in [TECH_STACK.md](TECH_STACK.md) and architecture in [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md). Contributor workflow is defined in [AGENTS.md](AGENTS.md). These supporting documents do not override this PRD's requirements or the delivery scope in [MILESTONES.md](MILESTONES.md).

- **Frontend:** TypeScript with lightweight framework.
- **App:** responsive PWA with layouts designed for phone capture and desktop learning; HTTPS deployment. Use normal browser navigation for the guaranteed workflow and installation only for enhanced capabilities.
- **Storage:** IndexedDB with persistence abstraction.
- **Metadata:** client-side where permitted, manual duration/pasted-text fallback; optional future extraction backend. The core release remains static and must pass acceptance without an extraction server or API key. A future extraction service would receive submitted URLs and needs an explicit privacy and operating-cost decision.
- **Recommendation:** separate deterministic scoring module.
- **Estimation:** configurable rules.
- **Notes:** lightweight text with stable IDs and a source-material association; format to be decided. Note relationships are deferred.
- **AI:** optional provider interface only, no MVP dependency.

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

## 15. Remaining Open Questions

1. Weekday/weekend presets or seven-day schedule?
2. Customizable Pomodoro focus/break durations?
3. Manual remaining-effort updates after sessions, or fixed estimate until completion?
4. Formal goals or categories/priorities only?
5. Plain text, Markdown, or rich text notes?
6. Exact browser/OS test matrix? Guarantee the paste-to-completion workflow on mobile and desktop; test receiving shares on installed Android Chrome PWA as an enhancement. Do not promise incoming shares on iOS/Safari; verify compatibility before each release.
7. Final name and visual identity?

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

**End of PRD v1.1**
