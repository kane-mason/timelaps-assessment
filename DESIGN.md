---
# DESIGN.md — the visual system for AI coding/design agents (Google Stitch open format).
# Humans read README.md; agents read this before generating or styling any UI.
name: Aurora Competitive Funnel View
description: >-
  A decision-ready competitive analytics view for a busy marketing leader. Premium,
  restrained, analytical — a modern strategy tool, not a colourful BI dashboard.

tokens:
  color:
    surface:
      base: "#F7F8FA"     # off-white — default page background
      raised: "#FFFFFF"   # cards / matrix cells
      muted: "#EEF1F4"    # soft grey — subtle fills, zebra rows
      inverse: "#0B1220"  # deep navy — optional single hero / inverse band
    text:
      primary: "#0B1220"   # near-navy ink
      secondary: "#5A6473" # muted grey — labels, secondary detail
      inverse: "#F7F8FA"   # text on dark surfaces
    brand:
      aurora: "#4F46E5"      # the ONE accent — reserved for Aurora (focus brand)
      aurora_soft: "#EEF0FE" # tint for Aurora cell backgrounds / emphasis
    competitor:
      neutral: "#9AA4B2"   # muted tone for Borealis / Cascade / Drift
    movement:
      positive: "#0F9D6B"  # green — gap narrowing / positive delta
      negative: "#E0653A"  # amber-red — gap widening / negative delta
      flat: "#9AA4B2"      # neutral — no meaningful change
    marker:
      leader: "#0B1220"    # small badge / border for the stage leader
    border: "#E2E6EB"
  typography:
    font_family:
      sans: "Inter, ui-sans-serif, system-ui, sans-serif"
      mono: "ui-monospace, 'SF Mono', monospace"
    scale_rem:           # type scale, rem
      display: 2.25
      h1: 1.75
      h2: 1.25
      body: 1.0
      small: 0.875
      micro: 0.75
    weight:
      regular: 400
      medium: 500
      semibold: 600
    numeric_features: "tabular-nums"   # align figures down the matrix
  spacing:
    base_px: 4
    scale_px: [4, 8, 12, 16, 24, 32, 48, 64]
  radius_px:
    sm: 6
    md: 10
    lg: 16
  elevation:
    card: "0 1px 2px rgba(11,18,32,0.06), 0 1px 1px rgba(11,18,32,0.04)"
  motion:
    policy: "minimal"      # subtle entrance transitions only; clarity over motion
    duration: "150-250ms"

# NOTE: concrete values (esp. the Aurora accent and font) are an initial proposal — refine.
---

# DESIGN.md — Aurora Competitive Funnel View

> Humans read `README.md`; agents read this. It defines how anything in this product should
> look and feel — follow the tokens above and the principles below before generating or styling
> any UI. North star: **a modern strategy tool, not a colourful BI dashboard — the insight
> should land in about ten seconds.**

## Principles

1. **Insight first, evidence second.** Lead with the conclusion — a narrative headline and a
   few sharp summary cards — then the detail (the matrix), then a short "what this means." The
   viewer should understand the story before inspecting any number.

2. **Comparison is the point.** Show the focus brand (Aurora) relative to its rivals, never in
   isolation. Make where it leads, where it trails, and where the gap is opening or closing
   immediately visible.

3. **Restraint is a feature.** Minimal decoration, generous whitespace, large readable numbers,
   no gratuitous animation or interaction. One excellent screen beats a broad, unfinished
   dashboard.

4. **Colour carries meaning, never decoration.** `color.brand.aurora` is the only branded
   colour — reserved for the focus brand; competitors render in `color.competitor.neutral`.
   `color.movement.*` encodes deltas and gap changes. Never a different strong colour per series.

5. **Premium and analytical.** Off-white / soft-grey surfaces, near-navy ink, clear type
   hierarchy; reserve `surface.inverse` (navy) for at most one hero band. Calm and confident.

6. **Every number is grounded.** Never invent, approximate, or eyeball a figure — each value
   traces to the data and is reproducible (`/verify-data`, the data contract). Show confidence
   honestly: flag thin / low-confidence figures (`n < 50`) rather than implying false precision.

7. **Plain, executive language.** Decision-focused copy, no jargon. Titles state the insight,
   not the widget ("Aurora's Competitive Funnel Position," not "Funnel Dashboard").

8. **Hierarchy through size and weight, not boxes.** The most important number is the biggest,
   in `tabular-nums`; secondary detail is quieter (`text.secondary`). Lead the eye down the
   priority order.

## Avoid

- Generic dashboard labels — titles that name the widget instead of the insight.
- Several separate charts where one comparative view tells the story better.
- Excessive filters, controls, or interactions — the main story should land without a click.
- Motion for its own sake; clarity beats animation.
