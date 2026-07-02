# Part 2 — AI Analyst: Architecture

> An analyst that answers a marketing leader's question in plain language **and** a single chart, where every figure is recomputed from the data, carries its base size on screen, and the honest "I can't answer that from this sample" is a designed behaviour you watch happen — not a footnote you have to trust.

## 1. The shape of the problem

The brand tracker is two cross-sectional waves of ~250 unweighted respondents each. The data is rich enough to answer "why did consideration move" cleanly, and thin enough that "which age group is driving growth" is a **trap**: the eye-catching mover (50+ consider 31.2% → 48.1%) rests on 5 → 13 people, and *every* Aurora consider-by-age cell is too thin to attribute.

**Scope, on purpose.** The brief opens Part 2 with "Using the **same dataset**," so this design targets *these* two waves — not arbitrary scale. The pure-function data layer (no database, no RAG), the closed 17-tool registry, and the sample-specific guards below are **deliberate consequences of that scoping, not limitations**: at ~500 records a database would be over-engineering and RAG would *harm* grounding. Designing for N respondent records is explicitly out of scope; the tool contract is the seam if it ever needed to generalise (swap in a warehouse behind the same interface). See the decisions log for the full rationale.

So the analyst is graded on five things, and four of them are really one thing: **can it stay honest when the data pushes it toward a confident wrong answer?**

- (a) how it decides **what** to compute
- (b) how it stays **grounded** in real numbers
- (c) how it **chooses** the visualization
- (d) how it handles **thin data** (n < 50)
- (e) **where it goes wrong**

## 2. The approach: register the tools and the guardrails, let the model bring the reasoning

The analyst is a bounded **Plan → Compute → Critique** loop (Critique loops back to Plan on a dead-end). Two choices carry it.

**First — the Plan is the _model_ selecting tools, not a table.** The 17 functions in `lib/metrics.mjs` are registered as an MCP tool surface on the call; the model decides which to call, and in what order, to answer the question. The six intents in §3 survive only as **optional starter hints**, never as a control-flow table. This is the scalability bet: models are getting more capable faster than anyone can hand-author analysis recipes, so a hard recipe table is a maintenance treadmill that also *freezes your 2026 idea of how to analyse* and gives a smarter model tunnel vision. Put the intelligence in the layer that is improving on someone else's budget — **you stop racing the model and start riding it.** A model upgrade makes the analyst sharper for free, with no code change.

**Second — Critique is plain code, not a second LLM.** A deterministic guard pass over a provenance-carrying `ComputeLog` turns "the analysis hit a dead end" into a typed, recoverable state (`thin` / `null` / `artefact` / `projection` / `out_of_scope`) that the model can re-plan against — exactly what the Q2 age trap demands. Critique never inspects the model's prose; it reads the **typed fields of the tool results** (`base_n`, `count`, `low_confidence`, `rate`, `is_projection`), so there is nothing free-form to parse. On a dead-end it hands control back to the model to re-plan, but only *after* barring the thin cells and pre-computing the mandatory cross-checks — so the model always re-plans over a ledger the guard has already made safe.

The division of labour is the whole design: **encode invariants, not procedures.**

- **Reasoning → the model.** What to compute, in what order, how to phrase it. This improves with every model generation, so it lives in the model.
- **Grounding & data-invariants → code.** The constrained tool surface, the deterministic guard, the claim-ledger. These are facts about *this dataset* — `n < 50` is unreliable, `null ≠ false`, the sample is unweighted — and **a smarter model doesn't make `n = 4` reliable**, so rediscovering them is never the model's job.

The test for which side a thing belongs on: *does it encode how to think (the model's job — it will outgrow you) or what's true about the data's limits (keep it fixed)?* Recipes are reasoning wearing a lab coat; they go. Guards are invariants; they stay.

The LLM therefore appears at two ends of the loop, with deterministic code in between:

1. **Front — understand, then drive.** The model's **first turn does both** in one LLM call: it names the intent + entities (**Parse** — validated against the live vocabularies, echoed back) *and* emits its first tool calls (**Plan**). Parse is the *understanding* half of that turn, **not a separate round-trip**. Then the loop repeats **Plan → Compute → Critique** (each later Plan is another call — code runs the tools, the guard checks the typed result) until the guard clears an answer. The edge back to Plan covers *both* "call the next tool" and "re-plan on a dead-end" — the "tool loop" and the "Critique loop" are the **same loop**.
2. **Back — submit & render.** The model finishes by calling **`submit_answer`** (instead of another tool) — one call carrying its plain-language answer + a `VizSpec` (*which* chart, as references into the ledger; no numbers, no drawing). **Critique validates that submission** against the ledger: *cleared* → deterministic code binds the spec to ledger values, draws the chart, and assembles the card; *vetoed* (it leans on a barred cell or a number not in the ledger) → a **code-authored finding** goes back and the model re-plans. So the model *decides to stop* (it submits); the guard *decides whether it's allowed out*.

`lib/metrics.mjs` decides every **value**; the loop decides whether a value may become a **claim**; the model decides only **which** tools and **how to say it** — never a number.

### Pipeline

| Stage | Kind | What it does |
|---|---|---|
| 0. Parse | LLM | NL → typed `AnalysisPlan` (intent, entities); entity slots resolve **only** against live vocabularies (`brandsOf`, `wavesOf`, `STAGES`, `{age_band, gender}`), so a slot can never hold an invented value. Shares the **first LLM call** with the first Plan. Low-confidence parse or out-of-vocabulary slot → `OUT_OF_SCOPE`. |
| 1. Plan | LLM | The model's turn — it selects and sequences the registered MCP tools (six intents = optional hints, not a fixed recipe; args type-checked against the live vocabularies). The loop **re-enters here** on a veto (a **re-plan** with the guard's finding — capped at 3). When it's done gathering, the model exits by calling **`submit_answer`** — its plain-language answer + a `VizSpec` of ledger *references* (no numbers, no drawing) — which Critique validates. |
| 2. Compute | compute | Dispatch each step to `lib/metrics.mjs` against `responses_raw.json`. Every function returns one of a **small set of fixed, typed shapes** (e.g. `{pct, count, base_n, low_confidence}`), each carrying its base size + confidence — *this consistency is what lets Critique be plain code*. `round1` (half-to-even) lives **inside** the functions so output byte-matches `analysed_outputs.json` (31.25 → 31.2). Append verbatim to the `ComputeLog`. |
| 3. Critique | guard | **The gate.** Deterministic (no LLM) — reads the typed result fields, checks each result, and **validates the model's `submit_answer`** against the ledger. Clean → ship; **veto** → a **code-authored finding** (inadmissible cells + boundary + solid alternative) → back to Plan. Patches the metric-layer holes; emits the **claim ledger**. |
| 4. Render | code → io | **Deterministic, no model.** Takes the cleared submission; binds the `VizSpec`'s references → ledger values → **draws the chart** (themed, thin cells greyed), then assembles the Glass-Box Answer Card: headline → chart → Trust strip → "Show the working" → Caveat rail. |
| 5. Trace | io | Each figure expands to `fn(args) → {value, count, base_n, low_confidence}`; footer ties back to `/verify-data` CI. |

*(Re-plan and `submit_answer` aren't separate stages — re-plan is the loop re-entering Plan on Critique's veto, and `submit_answer` is the model's exit action from Plan, gated by Critique.)*

## 3. (a) What to compute — the model selects tools; recipes are hints

The 17 functions are registered as MCP tools; the model chooses which to call and in what order. The six intents below are **optional starter hints** — scaffolds for the common question shapes the model may lean on, ignore, or extend for a question we never anticipated. They are documentation *for the model*, not a control-flow table.

- **explain_movement** → `funnelByBrandWave` + `waveDeltas` → `conditionalConversion` → `gapToLeader` → `headToHead`/`pullThrough` to localise.
- **attribute_to_segment** → `stageByDimension(dim)` per wave, cross-checked against a solid cut when the requested one is thin.
- **locate_gap** → `gapToLeader` → `headToHead` → `rejectionRate`.
- **size_opportunity** → `opportunityIfMatched`.
- **characterise_loyalty** → `repertoire` + `contestedDemand`.
- **describe_market** → `contestedDemand` + `shareOfStage`.

Crucially, the **honesty-critical steps are not left to the recipe** — a hint the model can ignore is not a guarantee. "Any movement or attribution claim must be mix-adjusted, and any thin demographic cut must be cross-checked against a solid one" is enforced as a **deterministic invariant in Critique** (§6), not as a recipe line the model must remember. That is what makes Q2's honest answer *structural*: even a model that plans a naive age-only analysis has the mix-check and the solid-cut cross-check appended by the guard, and the thin cells barred, before anything renders. The model owns the reasoning; the invariant owns the honesty.

## 4. (b) Grounded — the MCP tool layer + three structural locks

**The tool layer is an MCP server.** The 17 functions in `lib/metrics.mjs` aren't only called in-process — they're exposed as an **MCP tool server**: named endpoints (`funnelByBrandWave`, `conditionalConversion`, `stageByDimension`, `mixAdjustedDelta`, `headToHead`, …) any agent can connect to. That buys three things:

- **Reusable / open** — a client can point their *own* Claude Code (or any MCP-speaking agent) at the same tools; the registry is the product surface, not a private internal.
- **Honest-by-default** — every response is self-describing: `base_n`, `low_confidence`, `causal_admissible`, the denominator lens, and a suggested redirect ride on the wire, so *no* consumer can miss the caveats (§6). Data honesty travels *with* the tool; *enforcing* it — refusing to ship an answer that ignores it — is the analyst's job (the guard). **Honest tools open; enforcement is the product.**
- **One source of truth** — the same functions power Part 1's view, this analyst, and `/verify-data`, so a figure can't drift between them.

And because every endpoint returns a **fixed, typed shape**, a deterministic (code) guard can read known fields off known objects — which is exactly what lets Critique be plain code, not a second LLM. The locks below all rest on this surface.

**Lock 1 — Constrained tool surface.** The LLM's entire numeric vocabulary is the 17 exports in `lib/metrics.mjs`. The `fn` it names is an enum of exactly those; args are type-checked, entity values must be members of the live vocabularies. Off-list function or free-form arithmetic is rejected before any compute. **This is why handing the model the wheel on _what to compute_ costs nothing in grounding:** the guarantee was never that a *table* chose the tools — it is that the model can only ever *request a computation* from the registered surface, never emit a number. Who sequences the tools is irrelevant to whether one can be invented.

**Lock 2 — Plan-then-compute separation.** Raw rows are never in the LLM context. The model emits a recipe and receives only typed result objects, so it physically cannot mentally add counts. `countStage`'s strict `=== true` filter (null **and** false excluded — `null ≠ false` honoured in code, `lib/metrics.mjs:38-39`) and `round1`'s half-to-even (`:23-31`) live inside the functions.

**Lock 3 — Claim-ledger post-check, with typed derived values.** Narration is validated against the ledger: any prose number absent from a logged value fails the response. But the load-bearing insights are **derived comparisons** the metric layer never returns as a field — the *+4.6pt* conversion gain (52.3 − 47.7), the female gap *widening to −14.3*. A naive string match would either silence the analyst or, once relaxed, stop blocking invention. So the ledger admits a typed **`derived` entry kind** computed by a *second* closed set of pure combinators — `subtract(a,b)`, `ratioPointGain(rateA,rateB)`, `gapMovement(g0,g1)` — that take **only logged primitive entry-ids** as inputs and re-log their result with provenance pointing at the sources. Derived numbers become first-class, traceable ledger entries; the model still never does mental arithmetic.

**CI anchor.** `lib/metrics.test.mjs` already reproduces `funnel_by_brand_wave`, `wave_deltas` and `aurora_consider_by_age` to the decimal and pins the derived metrics against `docs/part1/derived-metrics.md`. `/verify-data` is the standing audit. Two additions close the gap that CI pins *functions*, not the analyst's *choices*: (1) a **golden-transcript test** pinning the full plan + args + ledger for Q1 and Q2 (intent, fn list, args, and the exact returned values), so a regression in *which* function the planner picks is caught; (2) extend the pinned fixture to include the live decision-changing surfaces (`conditionalConversion`, `gapToLeader.movement`, `mixAdjustedDelta`, `headToHead`, `stageByDimension('gender')`, `opportunityIfMatched`) for Aurora.

> `analysed_outputs.json` is the **CI fixture only**, never the analyst's data source. Every demographic cut routes through a *live* `stageByDimension` call from raw — so a request outside the cached Aurora/consider/age slice cannot be silently served from the file.

## 5. (c) Visualization — the model picks the form, code owns the values

The viz layer follows the **same principle as the planner** (§2): open where the model reasons, code-owned where honesty lives. A fixed dataset does *not* imply a fixed chart set — so we don't cap the analyst at a handful of hand-built components (that would tunnel-vision the viz the same way a recipe table tunnel-visions the analysis). Instead:

| Open — the model's job (improves with every model generation) | Code-owned — the invariant |
|---|---|
| **which chart, encoding, annotation** — emitted as a spec into an open, brand-themed, legibility-bounded grammar | **the values** (bound from the ledger) + **the confidence treatment** (thin cells greyed) |

**How it works.** Picking the chart is not a separate round — it rides on the **final Answer call** (§2): that one call emits the prose answer *and* a `VizSpec` — mark / encoding / annotation — carrying only **references** into the `ComputeLog`, never values (`{ chart, series: [ledgerRef…], benchmark?: ledgerRef }`). A deterministic renderer (stage 6) then resolves the refs, binds the numbers, applies the Timelaps theme, and carries the confidence flags — the model writes the words and picks the form; code draws the chart. So the analyst can visualize a question in a shape we never pre-designed — and a stronger future model picks *better* forms for free — while it remains structurally impossible for the model to **draw a number it didn't compute** or **un-grey a thin base** (the greying lives in the data+theme layer, not the model's choice). *Openness of form ≠ openness of numbers.*

**Two code-enforced floors:**

1. **Values floor** — every datum comes from the ledger (ref-only spec). This is the grounding guarantee, extended to pixels.
2. **Legibility floor** — the grammar is restricted to marks a marketing leader reads **at a glance** (the brief: *"a busy marketing leader can act on in seconds"*; *"read in one glance"*). A future model could invent a technically-faithful chart that's still unreadable; this floor bounds *form*, and it's the one real ceiling on the openness — not grounding, which is already handled.

**Legibility is time-to-comprehend, not time-to-answer.** An AI analyst is *expected to think* — the deliberate Plan→Compute→Critique loop may take a beat, and the UI can stream a visible "thinking" state while it does. The "at a glance" bar applies only to the **rendered answer card**: once it's on screen, the insight should land in seconds because it's *clear*, not because the analyst was *fast*. (DESIGN.md crystallizes this as "~10s to understand once rendered.")

**Branded presets, not a cage.** For the common shapes — and especially the two graded questions, which we must nail — the model's default pick is a curated house-style preset reusing the Part 1 idioms, so those stay pixel-clean and native:

| Common shape | Preset (Part 1 idiom) | Why |
|---|---|---|
| two-rate conversion (`conditionalConversion`) | comparison-rate panel | the insight is a conversion gain; both rates + a Borealis benchmark tick |
| delta / gap vector (`waveDeltas`, `gapToLeader`) | diverging delta bars | green = narrowing/good, rose = widening/bad, grey at zero |
| dimension cells (`stageByDimension`) | small-multiples with `n` + `count` | the **thin bases are the visual story**; low-confidence cells greyed to ~35% |

The presets are the *floor* of quality, not the *ceiling* of what's allowed: for a question we didn't anticipate, the model composes a new form within the open grammar. **One PRIMARY chart** as the hero + at most one supporting micro-viz — never two co-equal charts (the brief: *"Restraint is as telling as inclusion"*).

**Colour discipline** (enforced by the theme, so it holds even for a model-invented chart). Stage colour is categorical and identical across brands (aware amber / consider blue / used green); Aurora is distinguished **only** by an amber focus-tint container, never recoloured data; movement uses green/rose. Crucially, the **confidence signal does not reuse the semantic trio** — green already means "good delta", amber means "Aurora", blue is interaction. Confidence renders as **neutral ink-weight glyphs** (filled / hollow / hatched dot + an `n=NN` pill), so the trust layer never collides with stage/movement/focus colour — and travels with the data, not the model's chart choice.

## 6. (d) Thin data — n<50 is a loop stage, not a footnote

This guard is the clearest example of a **data-invariant, not an analysis strategy**: `n = 4` respondents cannot support a claim however capable the model is, so it is deliberately *not* the model's judgement to make — it lives in code and stays there.

`THIN_BASE = 50` is hard-coded (`lib/metrics.mjs:14`) and every base-bearing return carries `low_confidence` at the conditioning base it actually used. The guard runs **two checks**, because the brief's Q2 trap defeats a naive single one:

- **Check 1 — base:** `base_n < THIN_BASE`. Catches 50+ (n = 16 → 27).
- **Check 2 — numerator:** `count < THIN_COUNT` bars a cell from causal claims when its supporting count is too small, **even though the band base clears 50**. This catches the 25-34 "swing" (count 23 → 26, base 88/74, `low_confidence: false`) — ~3 people, inside noise — and the 50+ used cell (count 4).

`THIN_BASE = 50` is the real, shipped constant (`lib/metrics.mjs:14`, pinned by `/verify-data`) — and it's brief-derived (the `n < 50` rule). `THIN_COUNT = 30` is **our recommended threshold** — a heuristic, not a data-fact from the brief — so it belongs in the **guard layer**, documented as a recommendation, not baked in beside `THIN_BASE`.

Admissibility — `base_n ≥ 50 AND count ≥ THIN_COUNT` — is surfaced as a `causal_admissible` flag **on the tool response**, so *any* consumer (our analyst, or a client's own agent over MCP) is warned by default. (Today the shipped functions return `{pct, count, base_n, low_confidence}`; `causal_admissible` is derived from `count` + `base_n` and rides on the response — a small addition, not yet in the code.) The Trust-strip confidence dot keys off `causal_admissible`, not `low_confidence` alone — otherwise 25-34 (`low_confidence: false`, count 26) would render a solid dot while the prose refuses to name it. The tool *reports* admissibility; the **guard enforces it** — vetoing any answer that leans on a `causal_admissible: false` cell. Reporting is open; enforcement is the analyst's job.

> **How this generalizes (beyond this exercise's scope).** Exposing the metrics over MCP means *data honesty* rides on the response — flags, base sizes, `causal_admissible`, even a suggested redirect — so any client (their own agent, or ours) is warned by default; that's good tool citizenship, not privileged logic to withhold. The *enforcement* — refusing to ship an answer that ignores the warning — is orchestration only the consuming agent can run, and that is the analyst's value-add. **Honest tools, open; honesty enforcement, the product.**

**The handling ladder is enforced:** GATE (thin cells excluded from headline/causal claims) → FLAG (rendered greyed, `n` and `count` inline) → REDIRECT (if the headline cell is thin, the card is forbidden from naming it and stage 4 pivots to the strongest **significant** solid cut).

**A guard shapes presentation, never forbids exploration.** The model may still compute the thin 50+ cell and discuss it — the guard only governs how it is *presented*: greyed, count shown, barred from a causal claim, redirected. The moment a guard blanket-*suppresses* a cell rather than *annotating* it, it re-creates the rigidity the tool-selection design exists to escape. GATE→FLAG→REDIRECT annotates; it never hides.

### The redirect is instrumented, not just asserted

Pivoting Q2 to gender is *not* automatically safe. The female subsample collapses 124 → 98 between waves, so Aurora's female considerer **count actually falls 32 → 29** while its % rises (29.6%) partly because the denominator shrank. And the headline contrast "−14pt women vs −5pt men" is **within sampling margin** — a single-rate 95% CI at n≈98–136 is roughly ±9pp, and the gap-difference CI is wider than the 3.8pp "widening." So the metric layer gains a pure **`proportionCI` / `diffOfProportions`** function, and the guard gates a causal contrast on the **contrast being significant**, not just on `base_n ≥ 50`. This is the middle case — statistical *judgement* — done right: expose it as **tools the model reasons with**, backed by a deterministic **floor** (no causal claim on a handful of people). Tools not hardcoded methods; a floor not a cage. The honest Q2 output is therefore:

> The data cannot credibly name an age group. The robust statement is the **pooled** consider gain (+3.2pt, mix-adjusted +2.6, artefact 0.6 — real). Aurora's soft spot is **directionally** women (gap widening toward −14pt vs −5pt for men), but on these bases that gender contrast is within margin of error, and the female base shrank 124 → 98 between waves — so it is a hypothesis to track, not a confirmed driver.

That is more honest than "women are the answer," and it is what the loop produces by construction.

## 7. The answer, in two tiers — conventional first, curious second

The brief invites a secondary insight — *"If you spot a secondary insight worth surfacing, your call whether to include it. Restraint is as telling as inclusion."* So every answer has room for two tiers, and the split maps onto the same open / code-owned divide as the rest of the design:

- **The primary answer** is *conventional and decision-ready* — the analysis and chart a marketing analyst would expect, landing at a glance. It's anchored by the same **hints** the model already carries (the intent→analysis hints of §3, the branded viz presets of §5) — those *are* the "industry-standard suggestions." Curiosity never leaks up into it; the busy leader gets the expected answer, clean.
- **A curious follow-up** is *optional and clearly subordinate* — a quiet "Worth a look" beat where the model surfaces a non-obvious angle, a forward-looking watch-item, or a next lever. This is where agency and curiosity live, and where a stronger future model gets more interesting for free.

**Three rules keep the second tier honest — because curiosity is exactly where an analyst goes wrong:**

1. **It obeys the same guards, and they matter more here.** "Dig into a surprising subgroup" is how you land on a 5-person cell (the Q2 trap); "here's an interesting reason" is how you smuggle in a causal claim two cross-sections can't support. So the follow-up runs through the identical thin-data guard (§6), ledger grounding (§4), and the associational-verbs-only rule that blocks invented causation. Its numbers still come from tools; it can still be greyed, flagged, or refused. **Grounded curiosity is a feature; unguarded curiosity is the failure mode.**
2. **Opt-in, suppressible — never manufacture novelty.** The instruction is not "always add a follow-up" (that breeds marginal, invented angles) but "surface one *only when something non-obvious genuinely survives the guards; otherwise stay silent.*" Suppression is the default (see the fabricated-curiosity failure mode below).
3. **The primary stays at-a-glance.** The follow-up renders as a quieter, visually-subordinate strip beneath the card, so time-to-comprehend the primary is untouched.

None of this is new machinery: it reuses the hints (as the conventional anchor) and the guards (now also gating the follow-up), plus one system-prompt instruction and one render zone.

## 8. (e) Failure modes — and how the loop blocks each

1. **Thin numerator passes a denominator-only check** → two-part check (`base_n ≥ 50 AND count ≥ THIN_COUNT`); small-multiples print `count` beside `base_n`.
2. **Model does its own arithmetic / wrong rounding** → plan-then-compute keeps rows out of context; `round1` inside functions; ledger post-check + typed derived combinators.
3. **`shareOfStage` carries no flag and can be null** → it emits its own `denominator_lens: "category share, no respondent base"`; null guard renders "no base"; never quoted without the caveat.
4. **Null rate read as 0%** → null guard renders `—` "not computable, no base"; narration may not arithmetically compare a null.
5. **Projection shown as fact** → `is_projection: true` quarantined; hatched bar + badge + assumption string ("if Aurora converted at Borealis's 59.8% rate"); excluded from measured-figures trace.
6. **`aurora_consider_by_age` read from JSON and generalised** → JSON is CI fixture only; every cut is a live `stageByDimension` call recorded in the trace.
7. **%-of-aware vs %-of-250 confusion** → each function **returns** its own `denominator_lens` (e.g. `conditionalConversion` → "of those aware"); the Trust strip reads the lens from the same return as the number, so it cannot drift.
8. **Wave delta read as real when it is mix artefact** → `mixAdjustedDelta` auto-appended; mix guard uses a stated rule: downgrade if `|artefact| ≥ 0.5 × |raw_delta|` **or** a sign-flip on standardization. (On aware, raw +0.8 → std −0.1 = sign flip ⇒ "indistinguishable from composition" — which *strengthens* "not an awareness gain". On consider, 0.6 < 0.5×3.2 ⇒ real.)
9. **Wrong question answered confidently (misattribution)** → guard the **parse**: echo the resolved intent + entities back ("Reading this as: Aurora, consideration, Q4 → Q1") and pin the parse in CI for the graded examples.
10. **Out-of-scope coerced to an answer** → `OUT_OF_SCOPE` intent + a designed REJECT terminal state (no chart, a short "this data cannot answer X because Y; the closest it *can* say is Z").
11. **Hallucinated causal link between two real numbers** → since the data is two cross-sections, narration is constrained to **association** verbs; a guard flags causal verbs ("because", "driven by", "caused") on any claim not backed by a designed causal lens.
12. **Planner thrash** → hard cap of 3 passes; on exhaustion, state the reliability boundary and the assumed entities.
13. **Fabricated curiosity — a "worth a look" manufactured to fill the slot** → the second tier (§7) is opt-in and suppressed by default; a follow-up may only surface an angle that survives the same guards (base/count, mix, significance, associational framing). Nothing survives → no follow-up. Novelty is never a goal in itself.

## 9. The two graded questions, traced

### Q1 — "Why did Aurora's consideration move this wave?"

A clean, fully-grounded chain on solid bases.

- **Parse** → `explain_movement`; {Aurora, consider, Q4 → Q1 (assumed from "this wave"), leader Borealis}.
- **Compute** → `waveDeltas.Aurora` = {aware +0.8, consider **+3.2**, used +0.8}: consider rose to **32.4%** (base 250) while awareness is flat — **not an awareness gain**. `conditionalConversion.Aurora`: `consider|aware` **47.7% → 52.3%** on aware bases **153 → 155** (solid) — a **conversion** win (a +4.6pt derived gain). Same call: `used|consider` stuck **50.7% → 48.1%** (consider base), **below Borealis 59.8%** — the trial leak. `gapToLeader`: consider gap to Borealis **−10.0 → −8.4** (movement **+1.6**, narrowed), while the awareness gap **widened** (movement −8.8, as Borealis awareness surged +9.6).
- **Critique** → mix guard: `mixAdjustedDelta(consider)` raw +3.2 → std **+2.6**, artefact **0.6** on both age and gender — under threshold, so the move is **real**, not composition. No thin cells (all bases ≥ 153).
- **Honest qualifier** → the consider-gap narrowing is read *alongside* the blown-out awareness gap: it may partly be Borealis's reach surge not yet converting down-funnel, so it is framed as a conversion win on Aurora's side, not unqualified momentum.
- **Viz** → comparison-rate panel (`consider|aware` rising in blue vs `used|consider` flat in green, Borealis ~60% tick), Aurora in an amber container; small supporting delta bar (aware flat vs consider +3.2).
- **Curious follow-up** *(opt-in)* → *"Worth a look: the consideration gap to Borealis narrowed (−10.0 → −8.4), but Borealis's awareness surged +9.6 this wave — that new reach may convert down-funnel next wave."* Grounded, associational, forward-looking — a quiet second beat, not part of the headline.

### Q2 — "Which age group is driving Aurora's growth?"

The trap. The loop refuses to name an age group and redirects — visibly.

- **Parse** → `attribute_to_segment`; {Aurora, consider, age_band, both waves}.
- **Plan** → the model calls `stageByDimension(age_band)` per wave. It need not plan the rest: the Critique invariant appends `mixAdjustedDelta(age_band)` and a solid-cut (gender) cross-check whenever an attribution runs thin — so the honest answer holds even if the model's plan was naive.
- **Compute** → Q1 ages: 18-24 27.1% (count 19, n=70), 25-34 35.1% (count 26, n=74, `low_confidence:false`), 35-49 29.1% (count 23, n=79), **50+ 48.1% (count 13, n=27, `low_confidence:true`)**; Q4 50+ 31.2% (count 5, n=16). The eye-catcher is 50+ 31.2% → 48.1%.
- **Critique (the hinge)** → 50+ fails Check 1 (n=16 → 27) **and** Check 2 (count 5 → 13). 25-34 passes Check 1 but fails Check 2 (count 23 → 26 < THIN_COUNT) — the numerator trap. 50+ *used* count is literally 4. **Verdict: every Aurora consider-by-age cell is `causal_admissible: false`** — the age recipe is a dead end.
- **Replan (pass 2)** → every age cell barred, so control returns to the **model** with the finding; it re-plans to lead with the honest refusal, using the gender cross-check the guard's invariant already computed: `stageByDimension('gender')` Q1: Aurora female 29.6% (count 29, n=98) vs Borealis 43.9% = gap **−14.3**; Aurora male 34.6% (count 47, n=136) vs Borealis 39.7% = gap **−5.1**. `mixAdjustedDelta(consider)` confirms the pooled +3.2 survives (std +2.6, artefact 0.6).
- **Significance + base-shift check** → the −14 vs −5 contrast is within margin at n≈98–136, and the female base fell 124 → 98 (female considerer count 32 → 29). So gender is the **directional** read, not a confirmed driver.
- **Viz** → age small-multiples **rendered but greyed to ~35%** with `n=70 / 74 / 79 / 27` and counts inline (the refusal is *shown*), beside the solid gender gap bars (Aurora amber container vs neutral Borealis).
- **Headline** → "The data can't credibly name an age group. The biggest-looking mover, 50+ (31% → 48%), is just 5 → 13 people on a base of 16 → 27; the 25-34 'swing' is ~3 respondents. The robust read is the pooled +3.2pt gain (mix-adjusted +2.6). Aurora's soft spot is *directionally* women — gap widening toward −14pt vs −5pt for men — but on these bases that's a hypothesis to track, not a confirmed driver."
- **Curious follow-up** *(opt-in)* → *"Worth a look: if you want a lever rather than a driver, closing Aurora's consider→use gap to Borealis's ~60% is worth ~+3.8pp usage — a labelled projection, not observed."* A flagged what-if survives the guards, so it earns the slot; a thin-cell age story would not.

The honest refusal-and-redirect is a structural outcome of the loop, anchored to `/verify-data` so "is this number invented?" is answered by the test runner, not by trust.

---

_See [architecture-mockup.html](architecture-mockup.html) for a visual mockup of these elements (open in a browser). Every figure above is recomputed from `data/responses_raw.json` via `lib/metrics.mjs` and verified by `/verify-data`._
