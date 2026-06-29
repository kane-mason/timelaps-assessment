# Part 1 — design exploration (mockups)

Static HTML mockups — real-ish data + Timelaps tokens. Open any in a browser.

> Numbers in these are illustrative/rounded for layout. **Source of truth = `lib/metrics.mjs`
> / `analysed_outputs.json` / `docs/part1/derived-metrics.md`.** Don't copy mockup figures.

## Where we landed
The story is **"reach + trial, not preference"**, told in four sections: **01 the movement**
(the gap to the leader splitting in two) → **02 the standings** (Aurora #2, Borealis dimmed with
a green ★) → **03 the diagnosis** (plain-language "good news / problem" — reach not rejection, then
the trial leak) → **04 the takeaway**.

- **page-v9.html** — ⭐ the full-page lead. Same four sections as v7, but section 01 is now the
  **connected-race**: Aurora and Borealis joined by the gap line, both dots roll from last quarter
  to now, and the line colours in red (widened) / green (narrowed) as it settles. Animates on
  scroll-into-view, with a Replay button.
- **page-v7.html** — the static predecessor (section 01 was a gap timeline). Reference.
### Section 01 — candidate treatments (the movement, animated)
- **section1-chase-anim.html** — ⭐ Borealis pinned at "1st place" (green ★, front); Aurora the
  amber runner; a dashed ring marks last quarter; on view the runner slides from there to now
  (all lanes together), red where it drops back, green where it gains. `section1-chase.html` is
  the static version.
- **section1-race-both.html** — ⭐ both cars move: Aurora *and* Borealis roll from last quarter
  (dashed) to now over ~2.8s, so you see **Borealis is the one accelerating** (long green trails
  on awareness/used) while Aurora stalls. Each lane is **normalized + truncated to its own range**
  so small moves are visible; exact gaps live in the verdict text.
- **page-v8.html** — page-v7 with section 01 as an earlier timeline (superseded by the chase).
- **page-v2…v6.html** — earlier iterations of the hook/diagnosis; kept for the trail.
- **page-final.html** — pre-re-diagnosis lead; reference only.

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
