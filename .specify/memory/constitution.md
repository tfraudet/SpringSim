<!--
Sync Impact Report

Version change: [UNSET] -> 1.0.0

Modified principles (placeholders replaced):
- [PRINCIPLE_1_NAME] -> User-Centered UX (NON-NEGOTIABLE)
- [PRINCIPLE_2_NAME] -> Modern Visual Design
- [PRINCIPLE_3_NAME] -> Performance & Efficiency (NON-NEGOTIABLE)
- [PRINCIPLE_4_NAME] -> Minimal Dependencies & Simplicity
- [PRINCIPLE_5_NAME] -> Progressive Enhancement & Resilience

Added sections: none
Removed sections: none

Templates checked:
- .specify/templates/plan-template.md ✅ aligned
- .specify/templates/spec-template.md ✅ aligned
- .specify/templates/tasks-template.md ✅ aligned
- .specify/templates/commands/*.md ⚠ none present (no command files found)

Follow-up items:
- RATIFICATION_DATE: 2025-10-18 (provided)
-->

# SpingSim2 Constitution

## Core Principles

### User-Centered UX (NON-NEGOTIABLE)

All design and implementation decisions MUST prioritize clear, discoverable, and efficient user
journeys. The single-page application (SPA) MUST deliver end-to-end flows that let users
complete primary tasks in a minimal number of steps, with clear affordances and visible
state. Accessibility (WCAG 2.1 AA or better) and keyboard/navigation support are required.

Rationale: A successful SPA is defined by how easily users accomplish their goals. Making
UX non-negotiable prevents technical choices that sacrifice clarity or accessibility.

### Modern Visual Design

The application MUST present a cohesive, modern look-and-feel: consistent spacing,
typography, color system, and component usage. Use design tokens and a single source of
truth for theming. Micro-interactions and motion are allowed but MUST be subtle and
optimized for performance (see Performance principle). Visual regressions MUST be caught
during review (design review checklist) though automated visual testing is optional.

Rationale: Consistent visual language increases trust and reduces user cognitive load.

### Performance & Efficiency (NON-NEGOTIABLE)

The SPA MUST meet defined performance budgets. Aim for Lighthouse scores >= 90 where
reasonable, FCP (First Contentful Paint) under 1.5s on typical mobile networks, and
interactive time targets (TTI) that keep perceived latency low. Implement lazy loading,
code-splitting, and caching strategies to minimize initial bundle size and CPU overhead.
Measure performance with real metrics (RUM) and p95 targets; optimize hot paths first.

Rationale: Performance directly affects retention and conversion in SPAs. Declaring
performance non-negotiable keeps design and engineering aligned on measurable goals.

### Minimal Dependencies & Simplicity

Prefer zero-dependency or minimal-dependency implementations. Any dependency MUST be
approved via the dependency vetting checklist: size impact, maintenance activity, security
record, license compatibility, and long-term viability. Vendor and framework choices
should favor lightweight (e.g., Preact, Svelte) or vanilla implementations when they
meet UX and performance goals. Lockfiles and reproducible installs are required.

Rationale: Minimizing dependencies reduces bundle size, security surface area, and
maintenance burden—important for fast, reliable SPAs.

### Progressive Enhancement & Resilience

The SPA MUST degrade gracefully when full JS is unavailable or slow. Core content and
primary actions should remain accessible where feasible (server-side rendering or
prerendered fallbacks). Network error states MUST be handled explicitly with clear UI
messages and retry affordances. Offline capability (service workers) is encouraged for
high-value flows but optional depending on scope.

Rationale: Users operate in varied network and device conditions. Progressive
enhancement ensures broader reach and a better baseline experience.

## Additional Constraints

Technology and performance constraints tailored for a SPA:

- Target platform: modern browsers (last two major releases) and iOS/Android webviews.
- Preferred frameworks: lightweight frameworks or libraries; avoid heavy meta-frameworks
  unless necessary for the product goals.
- Bundle budget: aim for <= 150KB gzipped for initial critical JS where feasible; keep
  large features lazy-loaded.
- Accessibility: WCAG 2.1 AA baseline; keyboard focus, semantics, and color contrast
  validate on each release.
- Security: follow secure-by-default headers, CSP, and dependency vulnerability scans.

## Governance

Amendments to this constitution MUST be documented as a change note and approved by the
project maintainers. Major changes (removing or redefining a non-negotiable principle)
require a migration plan and a clear rollback strategy. Minor clarifications may be
approved by maintainers and recorded in the next patch amendment.

- Amendment procedure: propose change (PR) -> discuss (issue/PR comments) -> approval
  by at least two maintainers -> merge and update Last Amended date.
- Versioning policy: semantic versioning for the constitution itself:
  - MAJOR: backward incompatible governance or principle removals/redefinitions.
  - MINOR: new principle or material expansion of guidance.
  - PATCH: clarifications, wording fixes, or non-semantic refinements.
- Compliance: PRs touching UX or performance MUST reference which principle(s) they
  satisfy and provide evidence if relevant (metrics, screenshots, audit notes).

**Version**: 1.0.0 | **Ratified**: 2025-10-18 | **Last Amended**: 2025-10-18
