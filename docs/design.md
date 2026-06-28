# Design philosophy

How every screen in this project should look and feel. The deliverable is a **decision-ready
analytical view for a busy marketing leader** — these principles keep it that way. Read this
before building or styling any UI; it applies to both the Part 1 funnel view and the in-app
presentation of the Part 2 analyst.

> **One line:** a modern strategy tool, not a colourful BI dashboard. The insight should land
> in about ten seconds.

## Principles

1. **Insight first, evidence second.** Lead with the conclusion — a narrative headline and a
   few sharp summary cards — then the detail (the matrix), then a short "what this means." The
   viewer should understand the story before inspecting any number. The chart doesn't do all
   the work; the screen frames what matters.

2. **Comparison is the point.** Show the focus brand (Aurora) relative to its rivals, never in
   isolation. Make where it leads, where it trails, and where the gap is opening or closing
   immediately visible.

3. **Restraint is a feature.** Minimal decoration, generous whitespace, large readable
   numbers, no gratuitous animation or interaction. One excellent screen beats a broad,
   unfinished dashboard. (The brief explicitly rewards restraint; over-building reads as poor
   judgement.)

4. **Colour carries meaning, never decoration.** One accent reserved for the focus subject
   (Aurora); competitors in muted neutrals. Semantic colour for movement — green/blue positive,
   amber/red negative — and small markers for rank/leader. Never a different strong colour per
   series; that's noise.

5. **Premium and analytical.** Off-white / soft-grey / deep-navy surfaces, clear type
   hierarchy, calm and confident. It should feel considered — something a strategist would trust.

6. **Every number is grounded.** Never invent, approximate, or eyeball a figure — each value
   traces to the data and is reproducible (`/verify-data`, the data contract). Show confidence
   honestly: flag thin / low-confidence figures (`n < 50`) rather than implying false
   precision. Design integrity is numerical integrity.

7. **Plain, executive language.** Decision-focused copy, no jargon — "Aurora trails Borealis
   where consideration turns into buyers," not "multi-stage funnel variance." Titles state the
   insight, not the widget ("Aurora's Competitive Funnel Position," not "Funnel Dashboard").

8. **Hierarchy through size and weight, not boxes.** The most important number is the biggest;
   secondary detail is quieter. Lead the eye down the priority order.

## Avoid

- Generic dashboard labels — titles that name the widget instead of the insight.
- Several separate charts where one comparative view tells the story better.
- Excessive filters, controls, or interactions — the main story should land without a click.
- Motion for its own sake; clarity beats animation.
