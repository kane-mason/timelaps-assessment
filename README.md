# Timelaps — Founding Engineer · Technical Exercise

My submission for the Timelaps founding-engineer take-home. Two parts plus a short walkthrough video.

The full brief is in [docs/brief/exercise.md](docs/brief/exercise.md) (transcribed from the source PDF in the same folder).

## The task

- **Part 1 — Funnel comparison view** *(the bulk):* one decision-ready data-viz component showing where **Aurora** stands against its competitors (Borealis, Cascade, Drift) on the brand funnel (aware → consider → used), and how that competitive picture shifted **Q4 2025 → Q1 2026**. Delivered as a live link **or** a single self-contained HTML file. → [docs/part1/](docs/part1/)
- **Part 2 — AI analyst** *(design; code optional):* how I'd build an AI analyst over the same data — a natural-language question → analysis grounded in the actual numbers → a plain-language answer alongside a visualization. → [docs/part2/](docs/part2/)
- **Video (5–10 min):** Part 1 decisions, Part 2 approach, and ~60s on stack + AI tooling and why.

## Data

- [data/responses_raw.json](data/responses_raw.json) — 500 response-level records (250 × 2 waves), with nested-null funnel semantics (`null` = "not asked", **not** `false`).
- [data/analysed_outputs.json](data/analysed_outputs.json) — pre-computed funnel %s, wave deltas, and one age breakdown.
- [docs/data-profile.md](docs/data-profile.md) — a **verified** profile of both files: the key invariants (`aware ≥ consider ≥ used`), the `n < 50` low-confidence rule, and the unweighted / shifting-sample-mix caveats.

## Layout

| Path | Contents |
|---|---|
| [docs/](docs/) | The brief, the verified data profile, the [design philosophy](docs/design.md), per-part design notes ([part1/](docs/part1/), [part2/](docs/part2/)), and a [decisions log](docs/decisions.md). |
| [data/](data/) | Provided datasets the app consumes. |

The Part 1 build is set up to grow into a **Next.js app at the repo root** — app code (`app/`, `components/`, `package.json`, …) will live here alongside `data/` and `docs/`.

## Status

**Planning.** Brief, data, and a verified data profile are captured. Build not started.
