---
name: verify-data
description: Recompute the brand-funnel metrics (funnels, wave deltas, Aurora consider-by-age) from data/responses_raw.json via lib/metrics.mjs and assert they match data/analysed_outputs.json, plus pin the derived metrics and check the null-nesting invariants. Use before trusting any number in Part 1 or Part 2, after editing the data or lib/metrics.mjs, or whenever an agent computes a metric and wants to confirm it is grounded in the data rather than invented.
---

# verify-data

Re-derives every metric from the raw responses through the shared metrics module
([`lib/metrics.mjs`](../../../lib/metrics.mjs) — the single source of truth the app and the
Part 2 analyst also use) and compares it to `data/analysed_outputs.json`. This is the
**grounding check**: it proves a number came from the data, not from the model.

## Run it

```bash
node --test 'lib/**/*.test.mjs'
```

Zero dependencies (Node's built-in test runner). Exit `0` = everything reproduces and all
invariants hold. Exit `1` = at least one mismatch (the failing assertion is printed).

## What it checks

- **Funnels** — aware / consider / used % per brand × wave reproduce the provided file to the
  decimal. Numerator counts only `=== true`; denominator is **all respondents in the wave**.
- **Wave deltas** — Q1 − Q4 in percentage points, per brand and stage.
- **Aurora consider-by-age** — `consider_pct` and `base_n` per age band, with `n < 50` flagged.
- **Invariants** — null-nesting (`consider` null unless `aware === true`; `used` null unless
  `consider === true`), the four legal funnel states, and `aware ≥ consider ≥ used`.
- **Derived metrics** — conditional conversion, gap-to-leader, mix-adjusted deltas, share, and
  repertoire are pinned to the values hand-verified in
  [`docs/part1/derived-metrics.md`](../../../docs/part1/derived-metrics.md), so they can't drift.

The module rounds half-to-even (banker's rounding) to match the Python that generated
`analysed_outputs.json` — e.g. the 50+ Q4 cell is `31.2`, not `31.3`.

## Building on top of this

Add new metrics as pure functions in `lib/metrics.mjs` and a pinning test alongside. Every
metric must follow the same rules: `=== true` numerators, all-respondents denominator (unless
deliberately conditional), and `base_n < 50` flagged via the `low_confidence` field. The full
verified profile of the dataset is in [`docs/data-profile.md`](../../../docs/data-profile.md).
