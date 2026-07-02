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

### 2026-06-28 · Data strategy: mix both, bounded by a reliability boundary
Use the verified `analysed_outputs.json` as the headline spine; add three derived layers from
raw — **conditional conversion**, **mix-adjusted deltas**, **share of consideration**. Key new
finding: the thin-cell problem is far worse than the 50+ band — **every Aurora consider-by-age
cell is n<50 in both waves** (50+ used = 4 in Q1), so demographic decomposition is mostly noise.
Two consequences: Part 1 treats the pre-computed `aurora_consider_by_age` as low-confidence
(don't build the main insight on it — likely a trap), and **base-size awareness becomes the
headline feature of the Part 2 AI analyst**, not a footnote. Separately confirmed the unweighted
wave deltas are real, not mix artefact (age- and gender-standardized Δ within <1pt of raw). Full
working in `docs/part1/derived-metrics.md`.

### 2026-06-28 · Part 1 page story: the diverging gap to the leader
Organize the page around one non-obvious, comparison-first insight: **Aurora's gap to Borealis is
moving in opposite directions by stage** — closing on consideration (−10.0→−8.4) but widening at
both ends, awareness (−5.2→−14.0) and usage (−4.0→−8.8). Four beats: standings → diverging gap
(the hook) → why (conversion: aware→consider up, consider→used stuck ~48% vs Borealis ~60%) → so
what. All on solid n=250. Hero stays **Option I (stages-as-columns leaderboard)**, not drawn
funnels — reaffirms the parked `funnel-drawing-parked.html` (too close to Timelaps' product;
drawn funnels also hurt cross-brand comparison). Dropped from the main page: a standalone
share-of-stage strip (competes with the hero) and the 4th exec tile (kept 3). Reconciles the
ChatGPT page-design doc: adopt its layered structure, overrule its drawn-funnel hero. See
`docs/part1/spec.md` §3.

### 2026-06-29 · Part 1 story evolves to "reach + trial, not preference"
Cross-brand lenses (layer 2 in `lib/metrics.mjs`) re-diagnose Aurora's gap. The diverging gap
stays the visible *hook*, but the deeper spine is now: Aurora isn't disliked — head-to-head among
the 115 aware of *both* brands, consideration is −5.2 (vs the −8.4 headline) and closing; rejection
47.7% ≈ leader's 46.3%; 48% of considerers are exclusive. So the awareness side is a **reach**
problem (buy salience) and the usage side a **trial** problem, sharpest among **women** (−14pt vs
−5pt men; solid bases), worth ~+3.8pp usage (labelled projection). Spec §3/§5 rewritten; the page
gains a two-panel "diagnosis" section (reach-not-preference + the trial leak). Note: the
age-by-consider cut stays low-confidence — the trustworthy demographic signal is gender, not age.

### 2026-06-29 · App shell: an admin product with a sidebar and two routes
Wrap the app in an admin shell (left sidebar + top bar) so it reads as a real brand-intelligence
product, not a single bare page. Sidebar: Timelaps brand, an **Analysis** group with
**Competitive Funnel** (`/`, Part 1) and **AI Analyst** (`/analyst`, Part 2), a muted Settings
stub, and a user footer; top bar carries a breadcrumb + a Q1 2026 wave pill. The shell
(`components/shell/AppShell.tsx`, a client component using `usePathname` for the active link) lives
in the root layout so it persists across routes. `/analyst` is an intentional stub for now (ask
box + example questions + a "design in progress" note) — the real Part 2 wiring is next.

### 2026-06-30 · Part 2 design: a bounded loop with a *deterministic* critique
The AI analyst is designed as a **Plan → Compute → Critique** loop (Critique loops back to Plan on a dead-end) where the decisive
choice is that **Critique is plain code, not a second LLM** — a guard pass over a
provenance-carrying ComputeLog. The LLM only (a) picks one of six intents + typed entity slots,
(b) names a function from the closed 17-function `lib/metrics.mjs` registry, and (c) narrates over
already-logged values; the functions decide every number. **Grounding = three structural locks**
(constrained tool surface; plan-then-compute so raw rows never enter context; a claim-ledger
post-check with typed *derived* combinators for figures like the +4.6pt gain) **+ a CI anchor**
(`/verify-data` pins functions; a golden-transcript test pins the plan+ledger for the two graded
questions). **Thin data is a loop stage**, with a two-check guard (`base_n ≥ 50 AND count ≥ 30`,
named constants) — the second check is what catches Q2's numerator trap (25-34 swing = ~3 people
on a base that clears 50). Q2 ("which age group") therefore *refuses* to name a group and pivots
to gender — and even that redirect is instrumented (female base 124→98, contrast within margin →
"directional, not confirmed"). **Viz = one chart by result shape**, reusing Part 1 idioms; no new
library. Deliverables: `docs/part2/architecture.md` (source of truth) + a self-contained
`docs/part2/architecture-mockup.html`; the in-app page lands at `/analyst/architecture` next.
Every figure recomputed from raw and verified. The design choice itself (deterministic critique)
is the answer to "where it can go wrong": honesty is structural, not prompted.

### 2026-07-01 · Part 2 evolves: register the tools + guardrails, let the model reason (updates the 2026-06-30 entry)
The Plan stage moves from a deterministic `intent → recipe` table to **LLM-driven tool selection**:
`lib/metrics.mjs` (already written to be *exposed as MCP tools*) is registered on the call and the
model decides what to call and in what order — the pattern Kane has built in production (an
"insights" MCP server). The six intents survive only as **optional hints**.

The guiding principle is **encode invariants, not procedures**: *does a thing encode how to think
(the model's job — it will outgrow us) or what's true about the data's limits (keep it fixed)?*
Recipes are reasoning wearing a lab coat and will tunnel-vision a model that reasons better than
our 2026 idea of how to analyse; **a smarter model doesn't make `n = 4` reliable**, so the grounding
guards are a different kind of thing and stay in code. The scalability case: models improve faster
than we can maintain recipes, so **put the intelligence in the layer that's improving on someone
else's budget — you stop racing the model and start riding it** (a model upgrade sharpens the
analyst for free). That's the video's closing line.

What changes vs 2026-06-30: (1) Plan = an agentic tool-use loop (N capped model rounds), so the
LLM-call count goes from a 2-call floor to *parse + N tool-rounds + narrate* — the cost of
flexibility. (2) The honesty-critical auto-appends (mix-adjust every movement/attribution;
cross-check a thin cut against a solid one) move **out of the recipe and into Critique as
deterministic invariants**, so Q2's redirect holds even when the model's plan is naive. (3) Guards
are reframed from "analysis strategy" to **data-invariants**, and must *shape presentation, not
forbid exploration* (GATE→FLAG→REDIRECT annotates, never hides) or they become their own tunnel.
Statistical judgement stays the middle case done right: **tools not hardcoded methods, a floor not
a cage** (`proportionCI`/`diffOfProportions` exposed to the model, with a deterministic floor).
What does **not** change: the three grounding locks and the claim-ledger — grounding never depended
on a *table* choosing the tools, only on the constrained surface + the deterministic guard between
compute and narrate. `docs/part2/architecture.md` and the mockup are updated to match.

### 2026-07-01 · Part 2 is scoped to *this dataset* on purpose — not designed for arbitrary scale
The brief opens Part 2 with "Using the **same dataset**, describe how you would build an AI analyst."
We take that emphasis literally: the design targets the two provided waves of ~250 respondents, and
its scoping choices are **deliberate consequences of that constraint, not oversights.**

Why this shows up concretely:
- **The data layer is pure functions over a bundled JSON held in memory** (`lib/metrics.mjs` over
  `data/responses_raw.json`) — no database, no warehouse, no vector store / RAG. At ~500 records a DB
  would be pure over-engineering, and RAG would actively *harm* grounding (retrieving approximate
  matches instead of computing exact numbers — the one thing Part 2 must not do).
- **The tool registry is a fixed, closed set of 17 metric functions**, not a general query/SQL
  surface — because the analyses worth running against *this* dataset are enumerable.
- **The thin-data guards encode facts about this specific sample** (`n < 50` unreliable; every Aurora
  consider-by-age cell thin; gender is the trustworthy cut) — invariants that only mean something
  against these numbers.

We are explicitly **not** designing for N respondent records, or many waves/brands. If that were ever
needed, the tool contract is the seam — swap the in-memory functions for a warehouse query behind the
*same* interface and nothing above the tool layer changes — but generalising is **out of scope by the
brief's own framing.** Calling that out is the point: narrow-by-design reads as judgment, not
omission. (It's also the honest answer to "why no database / why not RAG?" in the video.)

### 2026-07-01 · Visualization follows the same "ride the model" principle — open grammar, code-owned values, legibility floor
Corrects an earlier over-reach. The "no chart library" call was **Part 1-scoped** (the funnel matrix)
and explicitly says "reconsider ... if a *secondary* visualization needs real charting"; and the
"small fixed vocabulary" in the first Part 2 draft was an assumption, not a constraint. **A fixed
*dataset* does not imply a fixed *chart set*** — capping the analyst at a few hand-built components
would tunnel-vision the viz exactly as a recipe table tunnel-visions the analysis.

So the viz layer mirrors the planner (see the tool-selection entry):
- **Model owns the form** — it emits a `VizSpec` (mark / encoding / annotation) into an **open,
  brand-themed, legibility-bounded grammar** (Vega-Lite-style is the standard target; a bespoke
  ref-only schema is the minimal one). It can visualize a question in ways we didn't pre-design, and
  a stronger future model picks better forms **for free**.
- **Code owns the values** — the spec carries only **references** into the `ComputeLog`; a
  deterministic renderer binds the numbers, applies the theme, and carries the confidence treatment
  (thin cells greyed). The model never supplies a value and can't un-grey a thin base. **Openness of
  *form* ≠ openness of *numbers*.**
- **Two code-enforced floors:** (1) values come only from the ledger; (2) the grammar is restricted
  to marks a marketing leader reads **at a glance** — sourced to the **brief** ("a busy marketing
  leader can act on in seconds"; "read in one glance"), not to our DESIGN.md number.
- **Latency ≠ legibility.** An AI analyst is *expected to think*; time-to-**answer** is not the
  constraint (the loop may take a beat and can stream a "thinking" state). The "at a glance" bar is
  time-to-**comprehend the rendered card**. DESIGN.md's "~10s" means ~10s to *understand once
  rendered*, not to respond.
- **Branded presets, not a cage** — the Part 1 idioms (comparison-rate panel, diverging delta bars,
  small-multiples-with-n) are the model's default pick for the common shapes and the two graded
  questions (kept pixel-clean); the open grammar is the long-tail path.

Vega-Lite was considered as the render target (the de-facto JSON chart grammar, with `vega-embed` /
`react-vega`, and a common LLM emission target). Not adopted as a hard choice yet — the *seam* is the
ref-only `VizSpec`; whichever renderer sits behind it (bespoke components now, a themed general
grammar later) is swappable without touching the model or the grounding.

Video beat: *"the analyst can visualize in ways I didn't design, and it'll improve as the models do —
but it can never draw a number it didn't compute, or a chart a marketing leader can't read at a glance."*

Note (process): two earlier claims mis-cited project artifacts as brief requirements — the Part-1
"no chart library" decision, and DESIGN.md's "~10s". Both are *ours, derived from the brief*, not the
brief itself. Keep that line sharp; the source may go to assessors.

### 2026-07-01 · Two-tier answers — conventional primary + an opt-in "curious" follow-up
Every answer has room for two tiers, mapping onto the same open / code-owned divide as the rest of
the design. **Primary:** the conventional, decision-ready analysis + chart a marketing analyst would
expect, landing at a glance — anchored by the hints the model already carries (intent→analysis hints,
branded viz presets; these *are* the "industry-standard suggestions" seeded in the system prompt).
**Curious follow-up:** an optional, clearly-subordinate "Worth a look" beat — a non-obvious angle, a
watch-item, a next lever — where the model's curiosity/agency lives and a stronger future model gets
more interesting for free.

Brief-grounded: *"If you spot a secondary insight worth surfacing, your call whether to include it.
Restraint is as telling as inclusion."* Three rules keep the second tier honest:
1. **Same guards, and they matter *more* here** — curiosity is exactly where you drift into thin
   cells (the Q2 trap) or causal over-claims. The follow-up runs through the identical thin-data,
   grounding, and associational-verbs guards; grounded curiosity is a feature, unguarded is the failure.
2. **Opt-in, suppressed by default** — never manufacture novelty. Surface a follow-up only when
   something non-obvious survives the guards; otherwise stay silent. New failure mode recorded:
   *fabricated curiosity*.
3. **Primary stays at-a-glance** — the follow-up is a quieter, visually-subordinate strip so
   time-to-comprehend the primary is untouched.

No new machinery — reuses the hints (conventional anchor) + the guards (now gating the follow-up),
plus one system-prompt instruction and one render zone. Reflected in architecture.md §7 + the two
traces, and a "Worth a look" strip on the mockup answer cards.

## Open

- **Part 2 working tool (stretch)** — the design is presented in the app regardless; whether
  to also build the analyst as an actual working tool is the open/stretch call, only if time
  allows after Part 1 is solid.
