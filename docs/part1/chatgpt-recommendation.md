# Timelaps Assessment Recommendation: Aurora Competitive Funnel View

> **Source:** ChatGPT output, provided by Kane (2026-06-28). Converted to Markdown for reference.
>
> **⚠️ Editor's note (added — not in the original):** This was produced from the **brief
> only** — the model was deliberately not given the dataset, so its thinking would focus on
> design and structure rather than the numbers. Every **figure** here is therefore an
> illustrative placeholder and does **not** match the real data — in places it implies the
> opposite (it shows Aurora *leading* awareness and consideration *falling*, whereas
> **Borealis leads every stage** and Aurora's consideration **rose +3.2pp**; it shows Drift
> *gaining*, but Drift is collapsing). **Use it for its structure and design direction only;
> build every figure and the narrative from the verified data** (`data/analysed_outputs.json`,
> `docs/data-profile.md`, checked with `/verify-data`). Treat all values below as layout filler.

---

## Goal

Build one polished, decision-ready screen showing where **Aurora** stands against
**Borealis, Cascade, and Drift** across the brand funnel, and how that competitive picture
shifted from **Q4 2025 to Q1 2026**.

The key requirement is **comparison** — not Aurora in isolation. It should help a marketing
leader quickly understand:

1. Where Aurora leads.
2. Where Aurora trails.
3. Where the competitive gap is opening or closing.
4. Which funnel stage needs attention.

The strongest solution is not just a chart — it's a well-designed analysed screen that tells
the story clearly.

## Core Recommendation

Build a custom **Competitive Funnel Matrix** as the hero visual of the page. It should
combine: Q1 2026 performance, change from Q4 2025, Aurora's rank against competitors, the gap
to the strongest competitor, and whether that gap improved or worsened.

A standard funnel chart is **not ideal**: funnel charts show one brand's progression well but
are poor for side-by-side competitive comparison. The brief asks for judgement, hierarchy,
and clarity — a custom matrix gives far more control over the story than a generic chart.

## Suggested Page Title

> **Aurora's Competitive Funnel Position**
> Subtitle: *Q1 2026 vs Q4 2025 · Aurora compared with Borealis, Cascade and Drift*

The title should make clear this is about Aurora's position in the market, not just funnel data.

## Main Narrative Headline

Use a headline that summarises the insight, not a generic dashboard label. It should be
generated from the actual data. Example:

> *"Aurora leads at the top of the funnel, but Borealis is pulling ahead where conversion
> matters most."*

Avoid weak titles like "Brand Funnel Comparison" or "Funnel Dashboard" — accurate, but not
decision-ready.

## Recommended Layout (mockup — illustrative numbers)

```
┌──────────────────────────────────────────────────────────┐
│ Aurora's Competitive Funnel Position                     │
│ Q1 2026 vs Q4 2025                                       │
│                                                          │
│ Aurora leads on awareness, but trails Borealis lower in  │
│ the funnel where consideration and purchase matter most. │
└──────────────────────────────────────────────────────────┘

┌───────────────┬───────────────┬───────────────┐
│ Strongest     │ Biggest Risk  │ Fastest Shift │
│ Awareness     │ Purchase      │ Borealis Gain │
└───────────────┴───────────────┴───────────────┘

┌──────────────────────────────────────────────────────────┐
│ Competitive Funnel Matrix                                │
│                                                          │
│ Stage          Aurora    Borealis   Cascade    Drift     │
│ Awareness      72% ▲3    68% ▲1     61% ▼2     55% ▲4    │
│ Consideration  48% ▼2    54% ▲5     41% ▲1     37% ▼1    │
│ Purchase       28% ▲1    36% ▲4     25% ▲2     18% —     │
│ Loyalty        14% —     22% ▲3     13% ▼1     10% ▲1    │
│                                                          │
│ Right side: Aurora gap to leader by stage                │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ What this means                                          │
│ 1. Aurora still has top-of-funnel strength.              │
│ 2. Borealis converts better through the lower funnel.    │
│ 3. The priority is not awareness; it is consideration →  │
│    buyer.                                                 │
└──────────────────────────────────────────────────────────┘
```

## Main Visual: Competitive Funnel Matrix

Funnel **stages as rows**, **brands as columns**.

- Suggested stages: Awareness, Consideration, Purchase, Loyalty / Frequent buyer *(depending
  on the provided data)*.
- Suggested brand columns: Aurora, Borealis, Cascade, Drift.

Each brand cell should contain:

- Q1 2026 value as the main number.
- Change from Q4 2025 as a small delta.
- A subtle horizontal bar showing relative scale.
- A rank marker, e.g. `#1`, `#2`, `#3`.
- Aurora highlighted more strongly than competitor cells.

```
Example cell (Aurora — emphasised):     Competitor cell (quieter):
  Aurora                                  Borealis
  72%                                     68%
  ▲ 3pp from Q4                           ▲ 1pp
  #1                                      #2
```

### Add a Decision Column

Include a right-side column, e.g. **"Aurora gap to leader"** — this is where the story becomes
decision-ready (the marketing leader shouldn't have to compute the gap manually). Example:

```
Awareness       Aurora leads by 4pp        Gap narrowed by 2pp
Consideration   Aurora trails Borealis 6pp Gap widened by 4pp
Purchase        Aurora trails Borealis 8pp Gap widened by 3pp
Loyalty         Aurora trails Borealis 8pp Gap unchanged
```

## Executive Summary Cards

Three concise cards above the matrix; brief and sharp, to guide the viewer before they inspect
the detail:

- **Card 1 — Strongest Position:** *Awareness — Aurora ranks #1, leading the nearest competitor by 4pp.*
- **Card 2 — Biggest Risk:** *Purchase — Aurora trails Borealis by 8pp, and the gap widened since Q4.*
- **Card 3 — Fastest Competitive Shift:** *Borealis momentum — gained across consideration, purchase and loyalty.*

## Visual Hierarchy

The page should read in this order:

1. Main narrative headline.
2. Three executive cards.
3. Competitive funnel matrix.
4. Short interpretation section.

The chart should not do all the work — the screen should clearly tell the viewer what matters.

## Design Direction

Premium, restrained, analytical. Recommended style:

- Off-white, soft grey, or deep navy background.
- Aurora highlighted with one distinctive accent colour.
- Competitors shown in muted neutral tones.
- Positive movement in green or blue; negative movement in amber or red.
- Plenty of spacing; large, readable numbers; minimal decoration; no unnecessary animation.

It should feel like a modern strategy tool, not a colourful BI dashboard.

### Best Use of Colour

Colour should communicate hierarchy and meaning — use it for: Aurora emphasis;
positive/negative movement; gap closing/widening; current leader per stage. Avoid a different
strong colour for every brand (noisy). Better: Aurora = strong accent; Borealis/Cascade/Drift
= muted greys/soft secondary tones; leader marker = small badge or border; gap status = green
for narrowing, red/amber for widening.

## Secondary Insight Worth Including

Include one short "conversion pressure" section if the data supports it. Example:

> *"Aurora's issue is not awareness. The competitive pressure appears lower in the funnel,
> where Borealis is converting more effectively from consideration into purchase and loyalty."*

Place below the matrix; three bullets maximum.

## What to Avoid

- **Four separate funnel charts** — clean individually, but make comparison hard.
- **A basic grouped bar chart as the whole solution** — shows the numbers but doesn't tell the
  story or surface gap movement clearly.
- **Too many filters** — this is an assessment, not a full product build; a single excellent
  screen beats a broad, unfinished dashboard.
- **Unnecessary interactions** — the main story should land without clicking.
- **Excessive animation** — subtle entrance transitions are fine; clarity matters more than motion.

## Recommended Implementation Approach

Build the main view as a **custom React component** rather than relying heavily on a charting
library. Recommended stack: Next.js, Vercel, React components, CSS Grid / Flexbox, custom data
calculations, optional small SVG icons for arrows or rank markers.

> A heavy charting library is probably unnecessary for the main visual. A custom matrix will be
> more impressive if it is polished.

### Suggested Component Structure

```
/app
  page.tsx
/components
  ExecutiveHeader.tsx
  InsightCard.tsx
  CompetitiveFunnelMatrix.tsx
  FunnelCell.tsx
  GapSummary.tsx
  InsightPanel.tsx
/data
  funnelData.ts
/lib
  calculateRanks.ts
  calculateGaps.ts
  formatDelta.ts
```

### Suggested Data Shape (⚠️ illustrative numbers — do not use)

```ts
export const funnelData = [
  {
    stage: "Awareness",
    brands: {
      Aurora:   { q4: 69, q1: 72 },
      Borealis: { q4: 67, q1: 68 },
      Cascade:  { q4: 63, q1: 61 },
      Drift:    { q4: 51, q1: 55 },
    },
  },
  {
    stage: "Consideration",
    brands: {
      Aurora:   { q4: 50, q1: 48 },
      Borealis: { q4: 49, q1: 54 },
      Cascade:  { q4: 40, q1: 41 },
      Drift:    { q4: 38, q1: 37 },
    },
  },
]
```

From this, calculate: Q1 value, Q4 value, delta, brand rank in Q1, Aurora's gap to leader, and
whether Aurora's gap narrowed/widened/held.

### Important Calculations

- **Brand delta:** `Q1 value − Q4 value` (e.g. `72 − 69 = +3pp`).
- **Aurora gap to leader:** if Aurora leads, `Aurora Q1 − second-place Q1`; else `Aurora Q1 −
  leader Q1` (e.g. `48 − 54 = −6pp`).
- **Gap movement:** compare Q4 gap with Q1 gap (e.g. Q4 gap `+1pp`, Q1 gap `−6pp` → moved
  `−7pp`, gap worsened by 7pp). One of the most important analytical pieces in the view.

## Recommended Copy Style

Simple, executive language. Good: *"Aurora leads awareness, but Borealis has taken the lead in
consideration and purchase."* / *"The competitive risk is lower in the funnel."* / *"Aurora's
gap to Borealis widened in purchase, suggesting conversion pressure."* Avoid: *"The data
indicates multi-stage funnel variance across competitive entities."* Keep it human and
decision-focused.

## Suggested Final Screen Story

> *"Aurora has strong top-of-funnel visibility, but its competitive position weakens further
> down the funnel. Borealis is the main threat because it is gaining where marketing impact
> turns into buyers. The priority is to defend awareness while improving conversion from
> consideration to purchase."*

## Video Walkthrough Structure

1. "I avoided a standard funnel chart because the brief is about competitive comparison."
2. "The page is structured for a marketing leader: headline, key cards, then the evidence."
3. "The matrix shows Q1 performance, Q4-to-Q1 movement, rank and relative bar strength."
4. "The right column is the decision layer: it shows whether Aurora's gap is opening or closing."
5. "The main insight is that Aurora's challenge is not just awareness; it is lower-funnel
   conversion against Borealis."

## Final Recommendation

Build a custom **competitive funnel matrix page**. The goal is not to prove you can render a
chart — it's to prove you can turn brand-tracking data into a clear marketing decision. The
best submission should leave the reviewer thinking: *"I understand Aurora's position
immediately, I can see where the gap is changing, and I know where the marketing leader should
focus next."*
