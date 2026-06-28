# Decisions log

A running record of the significant decisions made while building this assessment — what
was decided, why, and what's still open. New decisions go at the end of **Decided**. This
doubles as a script for the walkthrough video.

> **How to use:** when a meaningful build or design choice is made (stack, deliverable
> form, chart choice, analytical approach, a notable trade-off), add an entry with a one-
> or two-line rationale. Keep it tight.

## Decided

### 2026-06-28 · Keep private planning notes out of the shared repo
The repo may be shared with assessors. Anything that references external or personal context
lives in a gitignored `internal/` folder and is never committed or surfaced in the
deliverable. Everything else is committable.

### 2026-06-28 · Documentation lives under `docs/`; the root is for the app
Brief, data profile, per-part notes, and this log sit under `docs/`. The repo root is
reserved for the Next.js app so it stays clean once scaffolded. Each part has its own
`docs/partN/` folder for design notes.

### 2026-06-28 · Make the repo AI-agent-friendly
Added `AGENTS.md` + `CLAUDE.md`, always-on Cursor rules, and a `/verify-data` skill. The
data contract (the easy-to-get-wrong survey semantics) is documented once in
`docs/data-profile.md` and referenced everywhere else — a single source of truth.

### 2026-06-28 · Trust the provided `analysed_outputs.json`
Every pre-computed figure (funnels, wave deltas, the age breakdown) reproduces exactly from
`responses_raw.json` — verified by `/verify-data`. So we're free to use the pre-computed
numbers, recompute from raw, or mix; any recomputation must be checked against the source
with the skill.

### 2026-06-28 · One Next.js site for both parts, deployed to Vercel
Part 1 and Part 2 ship as a single Next.js app (one live link) rather than a standalone
self-contained HTML file — resolving the A1-vs-A2 fork in favour of the app.

Reasons — **primary: speed through familiarity.** Direct hands-on experience with Next.js,
Vercel, and the Vercel AI SDK makes this the fastest path to a polished deliverable in a
short turnaround, with strong conviction in the tools. Secondary: it mirrors Timelaps'
likely stack (Next / React / Vercel), gives one coherent submission and live link, and lets
the optional Part 2 working tool reuse the AI SDK alongside Part 1's data and design layer.
Trade-off accepted: a chart library and a deploy step are now in scope. (This rationale is
also the answer to the video's closing "stack + AI tooling, and why".)

**Guardrails:** Part 1 (the funnel view) is the priority and the bulk of the effort — it's
graded hardest on design taste. Part 2 appears in the app as an **"AI Analyst" page that
presents the design** (the graded deliverable, authored in `docs/part2/`); turning it into
an **actual working tool is a stretch** — optional and time-boxed, only after Part 1 is
solid. Keep Part 1 shippable early so turnaround stays fast.

### 2026-06-28 · No heavy charting library — custom funnel-matrix component
The Part 1 hero is a **competitive funnel matrix** (funnel stages × brands): a grid of cells,
each with a value, a Q4→Q1 delta, a rank badge and a small relative bar, plus a right-hand
"gap to leader" decision column. That's CSS Grid + minimal inline SVG — not something a
charting library renders better — and a polished custom component reads as more considered
than a generic chart. So **no Recharts / Chart.js / visx / Tremor** for the matrix; build it by
hand. Reconsider only if a *secondary* visualization later needs real charting (add a
lightweight lib then, scoped to it). Matches the external design recommendation
(`docs/part1/chatgpt-recommendation.md`), which reached the same conclusion from the brief alone.

### 2026-06-28 · Adopt DESIGN.md (open format) for the visual system
Use **`DESIGN.md`** at the repo root — the Google Stitch open format (YAML design tokens +
Markdown rationale) that AI coding/design agents read, the design-side sibling to AGENTS.md.
It captures the durable principles (decision-ready, insight-first, comparison-first, restraint,
colour-as-meaning, premium/analytical, grounded numbers) plus concrete tokens, and is wired into
AGENTS.md and an always-on Cursor rule so it's applied to all UI work. Tokens are taken from
the **Timelaps brand** (timelaps.io + product UI) — warm cream surfaces, near-black ink, an
amber focus-brand highlight, stage-categorical colour, and Rethink Sans — so the submission
feels native to their product rather than using an invented palette.

### 2026-06-28 · Tooling: next/font for the brand fonts; Framer Motion for restrained motion only
Don't build in Framer — it's their no-code marketing-site builder (no code export, wrong fit for
the data-grounded Next.js app). Take only what's reusable from that world: load **Rethink Sans +
Fragment Mono via `next/font/google`** (the Timelaps brand fonts, both free Google Fonts) so type
matches exactly, with the captured `.woff2` URLs as a fallback; and keep **`framer-motion`** for
*subtle entrance transitions only*, per the restraint principle — no gratuitous motion.

### 2026-06-28 · Funnel denominator: lead with % of all respondents; conditional as secondary
The matrix, ranks, deltas and gap-to-leader all use **% of all respondents** (the standard
brand-tracking metric; matches `analysed_outputs.json`). The **conditional conversion** view
(consider/aware, used/consider) is surfaced as a secondary "where the funnel leaks" insight — the
sharper diagnostic: Aurora converts consider→used at ~48% vs Borealis ~60%, the real lower-funnel
gap. See `docs/part1/spec.md`.

## Open

- **Part 2 working tool (stretch)** — the design is presented in the app regardless; whether
  to also build the analyst as an actual working tool is the open/stretch call, only if time
  allows after Part 1 is solid.
