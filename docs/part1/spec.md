# Part 1 — Build spec: Aurora's Competitive Funnel Position

The build-ready blueprint for the Part 1 view. Every number here is verified by
`/verify-data` (reproduces from `data/responses_raw.json`). This supersedes the old placeholder
and replaces the illustrative figures in [chatgpt-recommendation.md](chatgpt-recommendation.md)
with the real story. Visual system: [`DESIGN.md`](../../DESIGN.md).

## 1. What we're building

One decision-ready screen: where **Aurora** stands against Borealis, Cascade and Drift on the
funnel (aware → consider → used), and how the gap moved **Q4 2025 → Q1 2026**. A custom
**competitive funnel matrix** (no charting library), rendered statically in Next.js — no
backend (the data is a fixed file).

## 2. The data (verified, % of all respondents)

| Stage | | Aurora | Borealis | Cascade | Drift |
|---|---|--:|--:|--:|--:|
| **Aware** | Q1 (Δ vs Q4) | **62.0** (+0.8) | 76.0 (+9.6) | 44.0 (+1.2) | 30.4 (−6.4) |
| **Consider** | Q1 (Δ) | **32.4** (+3.2) | 40.8 (+1.6) | 19.6 (+2.4) | 11.6 (−3.2) |
| **Used** | Q1 (Δ) | **15.6** (+0.8) | 24.4 (+5.6) | 9.6 (+1.2) | 3.6 (−2.8) |

Rank is unchanging: **Borealis #1, Aurora #2, Cascade #3, Drift #4** at every stage.

**Aurora's gap to the leader (Borealis), and how it moved:**

| Stage | Q4 gap | Q1 gap | Movement |
|---|--:|--:|---|
| Aware | −5.2 | **−14.0** | widened 8.8pp ▼ |
| Consider | −10.0 | **−8.4** | **narrowed 1.6pp ▲** |
| Used | −4.0 | **−8.8** | widened 4.8pp ▼ |

**Conditional conversion (secondary lens — compute from raw counts in code):**

| Step | Aurora | Borealis |
|---|--:|--:|
| Aware → Consider | ~52% | ~54% |
| **Consider → Used** | **~48%** | **~60%** |

## 3. The story (honest narrative)

The visible hook is the **diverging gap**; the deeper, decision-driving story underneath is
**"reach + trial, not preference."** Five beats — the first three describe, the last two diagnose:

1. **The standings.** Aurora is a steady **#2** — comfortably ahead of Cascade and Drift,
   consistently behind Borealis at all three stages. *(funnel + rank)*
2. **The hook — the gap is *diverging*.** Aurora's distance to Borealis moves in *opposite
   directions* by stage: **closing on consideration** (−10.0 → −8.4) but **widening at both ends**
   — awareness (−5.2 → −14.0) and usage (−4.0 → −8.8). Gaining in the middle, losing at the edges.
   *(gapToLeader)*
3. **It's not that people dislike Aurora.** Among the 115 people who know *both* brands, Aurora
   nearly matches Borealis on consideration (**49.6% vs 54.8%, −5.2** — far tighter than the −8.4
   headline) and is *closing*. Its rejection rate among the aware (**47.7%**) is leader-level
   (Borealis 46.3%), and its considerers are as loyal as the leader's (**48% exclusive**). *(headToHead,
   rejectionRate, repertoire)*
4. **So the awareness side of the divergence is a *reach* problem** — too few people know Aurora,
   not too few like it. Fix it by buying salience; once people know Aurora, it competes.
5. **And the usage side is a *trial* problem, concentrated among women.** Aurora converts
   consideration → usage at ~48% vs Borealis's ~60% — the real lower-funnel leak. The weakness is
   sharpest with **women** (Aurora −14pt vs Borealis, vs −5pt among men; solid bases). Closing the
   conversion gap is worth **~+3.8pp usage** (a labelled projection). *(conditionalConversion,
   stageByDimension, opportunityIfMatched)*

**So what:** buy awareness (it's reach, not rejection), fix trial conversion (especially with
women). **Context:** Drift is collapsing; Cascade inches up; the contest that matters is Aurora
vs Borealis — and the market is getting more contested (switchable demand 31.7% → 38%).

## 4. Decision: which denominator

Lead with **% of all respondents** for the matrix, ranks, deltas and gap-to-leader (the standard
brand-tracking metric; matches `analysed_outputs.json`). Surface **conditional conversion**
(consider/aware, used/consider) as a secondary "where the funnel leaks" strip — it's the sharper
diagnostic and exposes Aurora's real weakness (consider→used). See the decisions log.

## 5. Screen structure (top to bottom)

1. **Header** — eyebrow "OVERVIEW", title *Aurora's Competitive Funnel Position*, subtitle
   *Q1 2026 vs Q4 2025*.
2. **Narrative headline** (the insight, generated from data):
   > *Aurora is the clear #2 — closing on Borealis in consideration, but losing ground in awareness
   > and usage.* (Subhead deepens it: *the gap is reach + trial, not preference.*)
3. **The hook — diverging-gap panel.** One focal visual: gap-to-leader per stage with Q4→Q1
   movement, so "gaining in the middle, losing at the edges" reads in one glance (rose = widening,
   green = closing). *(gapToLeader)*
4. **The standings — competitive leaderboard** (Option I, stages as columns): brands ranked within
   each stage, Aurora amber container highlight, leader green, others dimmed; relative bar scaled to
   the stage leader. *(funnelByBrandWave)*
5. **The diagnosis — two paired panels** (the re-diagnosis, the analytical heart):
   - **Reach, not preference** — head-to-head among the aware-of-both: consider 49.6% vs 54.8%
     (−5.2, vs the −8.4 headline) + the "liked as much as the leader" proof (rejection 47.7% vs
     46.3%). *(headToHead, rejectionRate)*
   - **The trial leak** — conditional conversion consider→used (~48% vs ~60%), with the women cut
     called out and the ~+3.8pp prize (labelled projection). *(conditionalConversion,
     stageByDimension, opportunityIfMatched)*
6. **"What this means"** (≤3 bullets):
   1. Aurora is a stable #2 and *as liked as the leader* — clear of Cascade/Drift.
   2. The consideration gap is mostly **reach**: once people know both, Aurora nearly matches Borealis.
   3. The real fixable weakness is **trial**, sharpest among women — and it's worth ~+3.8pp usage.

## 6. Design application

All from [`DESIGN.md`](../../DESIGN.md): cream `surface.base`, near-black ink, **Rethink Sans**
(numbers in `tabular-nums`). Colour by **stage** (amber/blue/green), consistent across brands;
Aurora distinguished by the **amber container** (`accent.focus` border + `accent.focus_tint`
fill), not by recolouring. Deltas use rose/green. Restraint: no filters, no animation beyond a
subtle entrance.

## 7. Components & data (Part 1 = static, no backend)

```
app/page.tsx                         # Server Component: load data, compute, render
components/funnel/
  ExecutiveHeader.tsx                # eyebrow + title + narrative headline
  InsightCard.tsx                    # one executive card (×3)
  CompetitiveFunnelMatrix.tsx        # the grid
  FunnelCell.tsx                     # value + delta + rank + relative bar; Aurora highlight
  GapToLeaderColumn.tsx              # decision column
  ConversionStrip.tsx                # secondary conditional-conversion insight
  InsightPanel.tsx                   # "what this means"
lib/
  metrics.mjs                        # ← source of truth (already built): funnel, deltas,
                                     #   gapToLeader, conditionalConversion, share, mix-adjusted.
                                     #   Pinned by lib/metrics.test.mjs / /verify-data.
  funnel/
    types.ts                         # view-model types over metrics.mjs output
    page-data.ts                     # thin: call metrics.mjs, shape for components
```

The page reads its numbers from `lib/metrics.mjs` — **no recomputation in components**, no second
copy of the funnel math. Computation runs at module/build time in the Server Component (no client
fetching, no API, no server actions). Client components only for any hover affordance.
`framer-motion` optional for a single restrained entrance.

## 8. Deliberate omissions

- **Three stages only** (aware/consider/used) — the data has no "loyalty/frequent buyer" stage.
- **No filters / no drill-down** — one excellent screen over a broad dashboard (restraint).
- **Caveat to keep honest:** brand funnels sit on n=250 (solid), so `n<50` isn't a Part 1 issue;
  but the sample is unweighted and its mix shifts between waves, so wave deltas carry a small
  mix-artefact — worth a one-line footnote, and it's central to Part 2's age-cut questions.
