# Derived metrics — what raw supports beyond the pre-computed outputs

> Analysis of `responses_raw.json` vs `analysed_outputs.json`, 2026-06-28. Every figure here is
> computed from raw and reproducible; none are invented. Companion to [spec.md](spec.md) and the
> [data profile](../data-profile.md). Decides the **mix-both** data strategy: use the verified
> outputs as the headline spine, add a few derived layers from raw, and respect the reliability
> boundary below.
>
> Every metric here is implemented as a pure function in [`lib/metrics.mjs`](../../lib/metrics.mjs)
> — the single source of truth the app, the Part 2 analyst, and the verification test all share.
> The figures below are pinned by `lib/metrics.test.mjs` (run via the `/verify-data` skill).

## What the outputs give us (and don't)

`analysed_outputs.json` contains only three things: brand×wave funnels (% of all respondents),
wave deltas, and `aurora_consider_by_age`. All reproduce from raw to the decimal. It's a
headline-only slice. Raw (500 records, full 4-brand funnel + age + gender per respondent)
supports more — but only some of it is trustworthy (see the boundary).

## Useful metrics NOT in the outputs

### 1. Conditional conversion rates — the funnel-*leak* diagnostic ⭐ (ships, secondary view)
"% of all respondents" sizes each stage but hides where the funnel leaks. Conditional rates
(stage given the prior stage) are the sharper read. Bases are healthy (aware n≈150–190).

| Brand | consider\|aware (Q4→Q1) | used\|consider (Q4→Q1) |
|---|---|---|
| **Aurora** | 47.7% → **52.3%** | 50.7% → 48.1% |
| Borealis | 59.0% → 53.7% | 48.0% → **59.8%** |
| Cascade | 40.2% → 44.5% | 48.8% → 49.0% |
| Drift | 40.2% → 38.2% | 43.2% → **31.0%** (collapsing) |

**Story:** Aurora's consideration gain is a *conversion* improvement (more of those who know it
now consider it, 47.7%→52.3%), but used\|consider is flat ~48–50% and **below Borealis's ~60%**.
Aurora's leak is at consider→use (trial), not awareness.

### 2. Mix-adjusted wave deltas — credibility check ⭐ (ships, behind the wave story)
The sample is unweighted and its mix shifts between waves, so deltas *could* be artefact. Tested
by standardizing Q1 to Q4's age mix, and separately to Q4's gender mix. **The artefact is tiny —
under 1pt on every metric.** The headline movements are real, not composition effects.

| Metric | raw Δ | age-std Δ | gender-std Δ |
|---|--:|--:|--:|
| Aurora consider | +3.2 | +2.6 | +2.6 |
| Aurora aware | +0.8 | −0.1 | +0.3 |
| Borealis aware | +9.6 | +9.4 | +10.3 |
| Borealis used | +5.6 | +5.4 | +6.0 |
| Drift aware | −6.4 | −7.3 | — |

This is a valuable *negative* finding: we can say "we checked whether the mix shift explains the
movement — it doesn't" rather than vaguely warning about the trap.

### 3. Gap-to-leader and its movement ⭐ (ships; the competitive-distance framing)
Aurora is #2 at every stage in both waves, so the story isn't rank churn — it's *distance from
Borealis*, and which way it's moving. This is the sharpest way to show the competitive picture.

| Stage | Q4 gap | Q1 gap | Movement |
|---|--:|--:|---|
| Awareness | −5.2 | **−14.0** | widened 8.8pp (Borealis accelerating) |
| Consideration | −10.0 | −8.4 | **narrowed 1.6pp** (Aurora's positive signal) |
| Used | −4.0 | −8.8 | widened 4.8pp (the lower-funnel concern) |

Aurora improved exactly where it shows (consideration), but Borealis stretched away on awareness
and usage. Pairs naturally with the conversion view: the consideration gain is real, the trial
gap is widening.

### 4. Competitive overlap / repertoire (raw-only; hold for Part 2)
All 4 brands per respondent → shared consideration is computable. Among Aurora-considerers (Q1,
n=81): **48% (39) consider Aurora exclusively**, 33% also consider Borealis, 20% Cascade, 12%
Drift. A competitive-dynamics signal the headline funnels can't show. Furthest from the
aware→consider→used framing, so a stretch / AI-analyst capability rather than a main-view chart.

### 5. Share of consideration (raw-only; optional)
Aurora holds ~29%→31% of all consideration mentions across the four brands — a category-share
framing that complements the absolute funnel.

## The reliability boundary (the binding constraint)

The thin-cell problem is **far worse than just the 50+ band.** Once Aurora is decomposed by age,
almost every cell below awareness is n<50:

| Aurora cell | Q4 base | Q1 base |
|---|--:|--:|
| 25-34 consider | 23 ⚠ | 26 ⚠ |
| 18-24 consider | 23 ⚠ | 19 ⚠ |
| 35-49 consider | 22 ⚠ | 23 ⚠ |
| 50+ consider | 5 ⚠ | 13 ⚠ |
| 50+ used | 5 ⚠ | **4 ⚠** |

**Every** Aurora consider-by-age cell is low-confidence, in both waves. The brief's example
question — *"which age group drives Aurora's growth?"* — lands entirely in this fog: the +3.2pt
consider gain *looks* led by 50+ (31%→48%), but that is **5→13 people on base 16→27**. Noise
dressed as insight.

What is actually reliable:

| Layer | Base | Verdict |
|---|---|---|
| Headline brand funnels (4×2) | n=250 | ✅ solid |
| Conditional conversion, top-level | aware n≈150–190 | ✅ solid |
| Mix-adjusted deltas | full wave | ✅ solid (artefact <1pt) |
| Share of consideration | full wave | ✅ solid |
| **Any** age/gender × consider or used | n≈4–26 | ⚠️ low-confidence (almost all of it) |

### Implications
1. **Part 1 resists the age-breakdown temptation.** The pre-computed `aurora_consider_by_age` is
   the one cut the data *can't* support well — arguably a trap watching whether we treat it
   credulously. If shown, it must be heavily caveated; the conversion-rate story carries the real
   insight instead.
2. **Base-size awareness is the headline feature of the Part 2 AI Analyst, not a footnote.** The
   correct answer to "which age group is growing?" is "the apparent answer (50+) sits on n<50 —
   here's the flag, and the robust read: overall consider is up, driven by aware→consider
   conversion."
3. **The strongest defensible Aurora story is full-sample:** aware flat, aware→consider conversion
   up (47.7%→52.3%), consider→use flat (~48%) and trailing Borealis (~60%). Survives
   mix-adjustment, no thin cells.

## Reconciliation with the ChatGPT findings doc

A separate analysis (`~/Downloads/timelaps_competitive_funnel_findings.md`, not in repo) reached
the **same core story** independently — mix both sources, conditional conversion is the key
missing metric, consider→used is Aurora's real leak, keep the age cut off the main screen, Aurora
is a strong #2. Its headline numbers (gap-to-leader, competitor average, conversion deltas) all
verify against raw. Adopted from it: **gap-to-leader** (#3 above) and the rank framing.

Where it is weaker, and this doc is the correction of record:

- **Age overconfidence.** It marks the 25-34/18-24/35-49 consider cuts "Confidence: OK" and names
  25-34 (+9.0pp) the headline age insight. But that swing is **23→26 considerers** (three people)
  with a ~±9–11pp margin of error — inside sampling noise. The brief's n<50 rule keys on the
  *denominator* (band base 74–88, which passes); the *numerator* is what's actually thin. Treat
  all Aurora consider-by-age as low-confidence, per the reliability boundary above.
- **No mix-adjustment.** It takes the wave deltas at face value; it never tests the documented
  unweighted-mix trap. Metric #2 here does (artefact <1pt → deltas are real).
- **"Funnel strength score" (sum of the 3 stages) is structurally invalid** — the stages nest, so
  it multiply-counts full-funnel users. Don't use it (it agrees it isn't a hero metric).
- **Competitor-average flatters Aurora** by averaging in collapsing Drift — fine as a soft support
  line, not load-bearing.
