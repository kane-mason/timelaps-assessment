---
# DESIGN.md — the visual system for AI coding/design agents (Google Stitch open format).
# Humans read README.md; agents read this before generating or styling any UI.
# Tokens are sourced from the Timelaps brand: https://www.timelaps.io/ (Framer) + product UI.
name: Aurora Competitive Funnel View
description: >-
  A decision-ready competitive analytics view for a busy marketing leader, in the Timelaps
  brand: warm, premium, restrained, analytical — a modern strategy tool, not a colourful BI
  dashboard.

tokens:
  color:
    surface:
      base: "#FCFAF6"      # warm cream — Timelaps' signature background
      raised: "#FFFFFF"    # cards / matrix cells
      cream: "#FFFDFA"     # lighter cream
      muted: "#F2F2F2"     # soft grey fills, zebra rows
      inverse: "#0A0A0A"   # near-black — dark CTA / single inverse band
    text:
      primary: "#0A0A0A"   # near-black ink
      secondary: "#737373" # grey — labels, secondary detail
      tertiary: "#A3A3A3"  # faint
      inverse: "#FCFAF6"   # text on dark surfaces
    action:
      primary: "#000000"   # black — primary CTA (e.g. "Book a Call")
      link: "#006AFF"      # blue — links, selection, interactive accent
      link_tint: "#CCE1FF" # light-blue selection tint / border
    accent:
      focus: "#FBBF24"     # amber — the tracked/focus brand highlight (Aurora)
      focus_tint: "#FEF3C7"# light amber — focus card background
      focus_soft: "#FFF6DD"
    stage:                 # categorical funnel-stage palette (consistent across all brands)
      aware: "#F59E0B"     # amber
      consider: "#38BDF8"  # sky blue
      used: "#4ADE80"      # green
      # Timelaps' 4th stage (frequent buyers) is pink #F472B6 — unused; our data has 3 stages.
    movement:
      positive: "#16A34A"      # green — gap narrowing / positive delta
      positive_tint: "#BBF7D0"
      negative: "#DB2777"      # rose/magenta — negative delta (Timelaps' ↓ pills)
      negative_tint: "#FFE6F1"
      flat: "#737373"
    border:
      base: "#E6E6E6"
      subtle: "rgba(34, 34, 34, 0.10)"
  typography:
    font_family:
      display: "'Rethink Sans', Inter, ui-sans-serif, system-ui, sans-serif"  # headings & numbers
      body: "'Rethink Sans', Inter, ui-sans-serif, system-ui, sans-serif"
      mono: "'Fragment Mono', ui-monospace, 'SF Mono', monospace"
    scale_rem:
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
      bold: 700        # Rethink Sans is set heavy for headlines
    numeric_features: "tabular-nums"   # align figures down the matrix
  spacing:
    base_px: 4
    scale_px: [4, 8, 12, 16, 24, 32, 48, 64]
  radius_px:
    sm: 8
    md: 12
    lg: 16
    pill: 999          # Timelaps uses fully-rounded pills for buttons/badges
  elevation:
    card: "0 1px 2px rgba(10,10,10,0.05), 0 1px 1px rgba(10,10,10,0.04)"
  motion:
    policy: "minimal"  # subtle entrance transitions only; clarity over motion
    duration: "150-250ms"
---

# DESIGN.md — Aurora Competitive Funnel View

> Humans read `README.md`; agents read this. It defines how anything in this product should
> look and feel — follow the tokens above and the principles below before generating or styling
> any UI. Tokens are taken from the **Timelaps brand** (timelaps.io + product UI). North star:
> **a modern strategy tool, not a colourful BI dashboard — the insight should land in about ten
> seconds.**

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

4. **Colour encodes stage and movement, not brand identity.** Each funnel stage has one
   consistent colour across all brands (`stage.aware` amber → `stage.consider` blue →
   `stage.used` green). The focus brand (Aurora) is distinguished by an **amber container
   highlight** (`accent.focus` border + `accent.focus_tint` fill), not by recolouring its data —
   exactly how Timelaps highlights the tracked brand. Deltas/gap changes use `movement.negative`
   (rose) and `movement.positive` (green). Never give each brand its own strong colour.

5. **Warm and premium.** Cream surfaces (`surface.base`), near-black ink, generous space, and
   **Rethink Sans** type. Black is reserved for primary actions; blue (`action.link`) for
   interaction/selection. Calm and confident — it should feel native to the Timelaps product.

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
- A different strong colour per brand — colour belongs to the stage, emphasis to the container.
