# Part 1 — design exploration (mockups)

Static HTML mockups — real-ish data + Timelaps tokens. Open any in a browser.

> Numbers in these are illustrative/rounded for layout. **Source of truth = `lib/metrics.mjs`
> / `analysed_outputs.json` / `docs/part1/derived-metrics.md`.** Don't copy mockup figures.

## Where we landed
- **page-final.html** — the lead candidate. Hero = Option I, wrapped in a story: intro → main → conclusion.

## The hero (Option I, "stages as columns")
- 3 stage columns (Aware / Consider / Used); brands ranked top→bottom inside each.
- Aurora = amber "YOU"; leader = green; competitors **dimmed**.
- Per-row bar (scaled within stage, leader = full) makes the gap visible.
- Column footer = **gap to leader** + whether it's closing/widening.

## Key design calls
- Per-row metric = **gap to leader**, not each brand's own wave change (comparison is the point).
- **% language only**; gap stated in points but footnoted, no "pp" jargon in-card.
- **Dimmed competitors** so Aurora reads first.
- **No generic icons** — they looked AI-templated; use colour + type instead.
- Page arc: headline + 3 orientation cards → leaderboard → bottom line (synthesis + conversion-leak diagnostic + recommended focus).

## Other options (reference)
- `option-i-columns` / `option-h-rows` — same content, columns vs rows.
- `matrix.html` — earlier stages × brands grid; clean but quietly assumes stable ranks.
- `slope-chart.html` — a line per brand; elegant but more analyst-y than marketing-leader.
- `funnel-drawing-parked.html` — literal funnel illustration. **Parked: too close to Timelaps' own product** (weak originality signal). Good video talking point only.

## Next
Build **page-final.html** for real in Next.js — static Server Component, HTML/CSS + a little inline SVG, no chart lib. New tokens to fold into DESIGN.md: leader-green, dimmed-competitor, gap-to-leader.
