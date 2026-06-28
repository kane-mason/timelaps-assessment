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

- **Aurora is a steady #2** — comfortably ahead of Cascade and Drift, consistently behind
  Borealis at all three stages.
- **The squeeze is top and bottom.** Borealis is winning awareness fast (+9.6 vs Aurora's
  +0.8 → gap blew out to −14pp) and converts consideration into use far better (~60% vs ~48%),
  widening the usage gap too.
- **Consideration is the bright spot** — Aurora's biggest gain (+3.2) and the *only* stage where
  the gap to Borealis is closing. It's the foothold; the play is to convert that momentum down
  the funnel.
- **Context:** Drift is collapsing (every stage down); Cascade inches up. The contest that
  matters is Aurora vs Borealis.

## 4. Decision: which denominator

Lead with **% of all respondents** for the matrix, ranks, deltas and gap-to-leader (the standard
brand-tracking metric; matches `analysed_outputs.json`). Surface **conditional conversion**
(consider/aware, used/consider) as a secondary "where the funnel leaks" strip — it's the sharper
diagnostic and exposes Aurora's real weakness (consider→used). See the decisions log.

## 5. Screen structure (top to bottom)

1. **Header** — eyebrow "OVERVIEW", title *Aurora's Competitive Funnel Position*, subtitle
   *Q1 2026 vs Q4 2025*.
2. **Narrative headline** (the insight, generated from data):
   > *Aurora holds a steady #2 — but Borealis is pulling away at the top and bottom of the
   > funnel. Consideration is the one gap Aurora is closing.*
3. **Three executive cards:**
   - **Bright spot — Consideration:** +3.2pp, Aurora's biggest gain and the only narrowing gap (−8.4pp).
   - **Biggest risk — Awareness:** Borealis surged +9.6pp while Aurora held flat; the gap blew out from −5.2 to −14.0pp.
   - **Fastest shift — Borealis:** extending its lead at awareness (+9.6) and usage (+5.6); Drift is collapsing.
4. **Competitive funnel matrix** — stages as rows, brands as columns. Aurora's column gets the
   amber container highlight. Each cell: Q1 value (large, `tabular-nums`), delta chip
   (▲/▼ pp, `movement.positive`/`negative`), rank badge (#1–#4), and a relative bar in the
   stage colour (`stage.aware/consider/used`), scaled to the row's max brand.
5. **Gap-to-leader column** (right of the matrix) — per stage: Aurora's gap to Borealis +
   whether it narrowed/widened (green/rose).
6. **Conversion strip** — the secondary conditional-conversion insight (the leak).
7. **"What this means"** (≤3 bullets):
   1. Aurora is a stable #2 — clear of Cascade/Drift, behind Borealis everywhere.
   2. The pressure is top and bottom: Borealis wins awareness fast and converts to use far better (~60% vs ~48%).
   3. Consideration is the foothold — growing and gap-closing.

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
lib/funnel/
  data.ts                            # typed load of analysed_outputs (+ raw for conversions)
  compute.ts                         # ranks, gaps, gap-movement, conversions (mirrors /verify-data)
  types.ts
```

Computation runs at module/build time in the Server Component — no client data fetching, no API,
no server actions. Client components only for any hover affordance. `framer-motion` optional for a
single restrained entrance.

## 8. Deliberate omissions

- **Three stages only** (aware/consider/used) — the data has no "loyalty/frequent buyer" stage.
- **No filters / no drill-down** — one excellent screen over a broad dashboard (restraint).
- **Caveat to keep honest:** brand funnels sit on n=250 (solid), so `n<50` isn't a Part 1 issue;
  but the sample is unweighted and its mix shifts between waves, so wave deltas carry a small
  mix-artefact — worth a one-line footnote, and it's central to Part 2's age-cut questions.
