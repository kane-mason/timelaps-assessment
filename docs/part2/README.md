# Part 2 — AI analyst (design)

A design for an AI analyst over the same dataset: a natural-language question →
analysis grounded in the actual numbers → a plain-language answer alongside a visualization.

Addresses how the analyst decides what to compute, how it stays grounded (rather than
inventing numbers), how it chooses a visualization, how it handles thin data (`n < 50`),
and where it can go wrong. Reasoned against the brief's two example questions.

Both parts ship on the **same Next.js site**: the design authored here is surfaced as an
in-app **"AI Analyst" page** (the graded deliverable). Turning it into an actual working
tool is a **stretch** if time allows. This folder stays the design's source of truth.

- **[architecture.md](architecture.md)** — the design: a bounded Plan→Compute→Critique→Replan
  loop with a *deterministic* critique, three grounding locks over `lib/metrics.mjs`, a
  two-check thin-data guard, viz-by-result-shape, and 12 failure modes. Both example questions
  traced end-to-end with figures verified by `/verify-data`.
- **[architecture-mockup.html](architecture-mockup.html)** — a self-contained, on-brand visual
  of those elements (open in a browser). Precursor to the in-app `/analyst/architecture` page.
