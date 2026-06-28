# Dataset map — Timelaps technical exercise

> Companion to `exercise.md`. A profile of the two data files, with the brief's claims verified
> programmatically. Descriptive only — no solution to Part 1/2 here. Profiled 2026-06-28.

## TL;DR

- **`responses_raw.json`** — a flat **list of 500 respondent records** (250 per wave × 2 waves).
- **`analysed_outputs.json`** — pre-computed **funnel %s** (4 brands × 2 waves), **wave deltas**, and **Aurora consider-by-age**, plus a `meta` block with definitions.
- **All pre-computed numbers reproduce exactly from the raw data** (funnels, deltas, age breakdown — checked). The data is internally consistent.
- **Null-nesting is clean** (0 violations): only 4 funnel states ever occur.
- **The traps are real and load onto the example questions:** the sample is **not demographically matched across waves**, the unweighted wave deltas are therefore partly **sample-mix artefacts**, and the thin cells (`n<50`) sit exactly where the "which age group" question points (50+).

---

## File 1 — `responses_raw.json`

Top-level: **JSON array, length 500.** One object per respondent per wave.

### Record schema

```jsonc
{
  "wave": "2025-Q4",                       // "2025-Q4" | "2026-Q1"
  "respondent_id": "R-2025-Q4-0116",       // unique per record
  "submitted_at": "2025-11-18T09:00:00Z",  // ONE fixed timestamp per wave (see note)
  "country": "ZA",                         // always "ZA"
  "age_band": "25-34",                     // 18-24 | 25-34 | 35-49 | 50+
  "gender": "male",                        // male | female | nonbinary | prefer_not_say
  "brand_funnel": {
    "Aurora":   { "aware": true,  "consider": true,  "used": false },
    "Borealis": { "aware": true,  "consider": false, "used": null  },
    "Cascade":  { "aware": false, "consider": null,  "used": null  },
    "Drift":    { "aware": false, "consider": null,  "used": null  }
  }
}
```

### Dimensions present

| Field | Values (counts across all 500) |
|---|---|
| `wave` | `2025-Q4` (250), `2026-Q1` (250) |
| `country` | `ZA` (500) — single country, no geo cut available |
| `age_band` | `18-24` (149), `25-34` (162), `35-49` (146), `50+` (43) |
| `gender` | `male` (250), `female` (222), `prefer_not_say` (17), `nonbinary` (11) |
| brands (in `brand_funnel`) | `Aurora`, `Borealis`, `Cascade`, `Drift` |

### Verified invariants

- **Null-nesting holds, 0 violations.** Only these 4 `(aware, consider, used)` states exist:
  | state | meaning | count |
  |---|---|---|
  | `(false, null, null)` | not aware → not asked further | 951 |
  | `(true, false, null)` | aware, won't consider | 537 |
  | `(true, true, false)` | considers, hasn't used | 258 |
  | `(true, true, true)` | full funnel | 254 |
  → `consider`/`used` are genuinely `null` = "not asked", never `false`-when-it-should-be-null. Any code **must treat `null` as "not asked," and count only `=== true`** for each stage numerator, with **denominator = all respondents in the wave**.
- **Funnel %s = % of ALL respondents** (not % of aware). Confirmed: every brand/wave recomputed from raw matches `analysed_outputs` to the decimal.

### Note: `submitted_at` is not real time-series
Every record in a wave shares one identical timestamp (`2025-11-18T09:00:00Z` for Q4, `2026-02-17T09:00:00Z` for Q1). It marks the **wave**, not real submission times — there is **no intra-wave time signal** to mine.

---

## File 2 — `analysed_outputs.json`

Top-level object with 4 keys:

### `meta`
```jsonc
{
  "tracker_brand": "Aurora",
  "competitors": ["Borealis", "Cascade", "Drift"],
  "country": "ZA",
  "definition": "each pct = % of all respondents in that wave (consider/used are subsets of aware); base_n is unweighted respondents",
  "small_base_rule": "flag any figure on base_n < 50 as low-confidence"
}
```

### `funnel_by_brand_wave` — the headline numbers (each brand × wave: `aware_pct`, `consider_pct`, `used_pct`, `base_n`)

| Brand | Wave | Aware | Consider | Used | base_n |
|---|---|--:|--:|--:|--:|
| **Aurora** | 2025-Q4 | 61.2 | 29.2 | 14.8 | 250 |
| **Aurora** | 2026-Q1 | 62.0 | 32.4 | 15.6 | 250 |
| Borealis | 2025-Q4 | 66.4 | 39.2 | 18.8 | 250 |
| Borealis | 2026-Q1 | **76.0** | 40.8 | 24.4 | 250 |
| Cascade | 2025-Q4 | 42.8 | 17.2 | 8.4 | 250 |
| Cascade | 2026-Q1 | 44.0 | 19.6 | 9.6 | 250 |
| Drift | 2025-Q4 | 36.8 | 14.8 | 6.4 | 250 |
| Drift | 2026-Q1 | 30.4 | 11.6 | 3.6 | 250 |

### `wave_deltas` — Q1 minus Q4, in **percentage points** (verified = simple pct difference)

| Brand | Δ Aware | Δ Consider | Δ Used |
|---|--:|--:|--:|
| Aurora | +0.8 | +3.2 | +0.8 |
| Borealis | +9.6 | +1.6 | +5.6 |
| Cascade | +1.2 | +2.4 | +1.2 |
| Drift | −6.4 | −3.2 | −2.8 |

### `aurora_consider_by_age` — Aurora `consider_pct` by age (= % of **all** respondents in that age cell), with `base_n`

| Age | Q4 consider% (base) | Q1 consider% (base) |
|---|---|---|
| 18-24 | 29.1 (79) | 27.1 (70) |
| 25-34 | 26.1 (88) | 35.1 (74) |
| 35-49 | 32.8 (67) | 29.1 (79) |
| 50+ | 31.2 (**16** ⚠️) | 48.1 (**27** ⚠️) |

Confirmed: this is `consider% of all in the age band` (not % of aware), `base_n` = age-band size.

---

## Watch-outs (data characteristics that should shape scoping — not solutions)

1. **The sample is NOT matched across waves.** Both waves are n=250, but the *composition* drifts:
   | cut | 2025-Q4 → 2026-Q1 |
   |---|---|
   | 50+ | 16 → 27 |
   | 18-24 | 79 → 70 |
   | 35-49 | 67 → 79 |
   | female | 124 → 98 |
   | male | 114 → 136 |
   Because the data is **unweighted** (meta says so), some of every wave delta is **demographic-mix artefact**, not real brand movement. Worth a sentence in the video; relevant to how much to trust raw wave-on-wave deltas.

2. **Thin cells, and they sit on the obvious question.** `n<50` cells:
   - **50+ is low-confidence in BOTH waves** (16, then 27).
   - `nonbinary` (6, 5) and `prefer_not_say` (6, 11) are tiny — gender cuts beyond male/female are unreliable.
   - Sub-funnel bases shrink fast: Aurora **50+ `used` = 5 then 4 respondents**; 50+ `consider` = 5 then 13.

3. **The example questions land on the traps:**
   - *"Which age group is driving Aurora's growth?"* — the headline +3.2pt consider decomposes as: **25-34 jumps 26.1→35.1** (solid-ish base 88→74) and **50+ jumps 31.2→48.1 but on base 16→27 (both <50, noisy)**, while 18-24 and 35-49 fall. The biggest-looking mover (50+) is the least trustworthy — exactly the small-base trap they flagged.
   - *"Why did Aurora's consideration move?"* — invites decomposition (by age/gender/sub-funnel) where most slices are thin and the sample mix shifted.

4. **Two valid "consider/used" denominators exist.** They standardised on **% of all respondents**. A conditional view (**% of aware** = "of people who know us, how many consider"; **% of consider** = conversion to use) is *not* pre-computed but is trivial from raw and is often the sharper diagnostic for "where is the funnel leaking." Candidate's choice — just be deliberate about it.

5. **Competitive context (factual, for orientation only):** Borealis leads every stage and is pulling away (aware +9.6, used +5.6). Drift is collapsing across the board (all deltas negative). Aurora is steady with a real consideration gain (+3.2). Cascade inches up. Aurora sits clearly 2nd behind Borealis, comfortably ahead of Cascade/Drift.

---

## Reproduce these checks

```bash
# run from repo root
python3 - <<'PY'
import json
d=json.load(open('data/responses_raw.json')); a=json.load(open('data/analysed_outputs.json'))
W=sorted({r['wave'] for r in d})
for b in a['funnel_by_brand_wave']:
  for w in W:
    s=[r for r in d if r['wave']==w]; n=len(s)
    f=lambda k: round(100*sum(1 for r in s if r['brand_funnel'][b][k] is True)/n,1)
    assert (f('aware'),f('consider'),f('used'))==tuple(a['funnel_by_brand_wave'][b][w][x] for x in('aware_pct','consider_pct','used_pct'))
print("all funnels reproduce from raw ✓")
PY
```
