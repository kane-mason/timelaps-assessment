---
name: verify-data
description: Recompute the brand-funnel metrics (funnels, wave deltas, Aurora consider-by-age) from data/responses_raw.json and assert they match data/analysed_outputs.json, plus check the null-nesting invariants. Use before trusting any number in Part 1 or Part 2, after editing the data, or whenever an agent computes a metric and wants to confirm it is grounded in the data rather than invented.
---

# verify-data

Re-derives every pre-computed metric from the raw responses and compares it to
`data/analysed_outputs.json`. This is the **grounding check**: it proves a number came
from the data, not from the model.

## Run it

```bash
node .claude/skills/verify-data/verify.mjs
```

Exit `0` = everything reproduces and all invariants hold. Exit `1` = at least one mismatch
or invariant violation (details are printed per check).

## What it checks

- **Funnels** — aware / consider / used % per brand × wave. Numerator counts only answers
  that are `=== true`; denominator is **all respondents in the wave**. Also checks `base_n`.
- **Wave deltas** — Q1 − Q4 in percentage points, per brand and stage.
- **Aurora consider-by-age** — `consider_pct` and `base_n` per age band, flagging `n < 50`.
- **Invariants** — null-nesting (`consider` is null unless `aware === true`; `used` is null
  unless `consider === true`), the four legal funnel states, and `aware ≥ consider ≥ used`.

It rounds half-to-even (banker's rounding) to match the Python that generated
`analysed_outputs.json` — e.g. the 50+ Q4 cell is `31.2`, not `31.3`.

## Building on top of this

Any new metric computed from the raw data must follow the same rules: `=== true`
numerators, all-respondents denominator, and `n < 50` flagged as low-confidence. The full
verified profile of the dataset is in [`docs/data-profile.md`](../../../docs/data-profile.md).
