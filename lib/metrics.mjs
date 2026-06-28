// Brand-funnel metrics — the single source of truth for every number the app, the Part 2
// AI analyst, and the verification test report. Pure functions: pass in the raw respondent
// array (data/responses_raw.json), get grounded results back. No figure is invented here;
// each one is counted from raw and carries its own base_n and low_confidence flag so callers
// never have to remember the n<50 rule.
//
// Data contract (see docs/data-profile.md):
//   - null means "not asked", never false. Count a stage only where the value === true.
//   - Stages nest: aware ≥ consider ≥ used.
//   - Percentages are of ALL respondents in the wave (denominator ≈ 250), not % of aware.
//   - base_n < 50 is low-confidence.

export const STAGES = /** @type {const} */ (['aware', 'consider', 'used'])
export const THIN_BASE = 50 // brief's low-confidence threshold

/** @typedef {{ pct: number, count: number, base_n: number, low_confidence: boolean }} StageStat */
/** @typedef {{ rate: number, numerator: number, denominator: number, low_confidence: boolean }} Conversion */

const lowConf = (base_n) => base_n < THIN_BASE

// Round half-to-even at 1 decimal, matching the Python that produced analysed_outputs.json.
// (Plain Math.round turns 31.25 into 31.3; the source rounds it to 31.2.)
export function round1(x) {
  const scaled = x * 10
  const floor = Math.floor(scaled)
  const diff = scaled - floor
  let r
  if (Math.abs(diff - 0.5) < 1e-9) r = floor % 2 === 0 ? floor : floor + 1
  else r = Math.round(scaled)
  return r / 10
}

/** Brands present in the funnel, in file order. */
export const brandsOf = (raw) => Object.keys(raw[0].brand_funnel)
/** Waves present, sorted ascending. */
export const wavesOf = (raw) => [...new Set(raw.map((r) => r.wave))].sort()
/** Count respondents in `rows` for whom brand/stage is strictly true (null/false excluded). */
export const countStage = (rows, brand, stage) =>
  rows.filter((r) => r.brand_funnel[brand][stage] === true).length

const rowsIn = (raw, wave) => raw.filter((r) => r.wave === wave)

/**
 * One brand's stage stat within a set of rows: pct of those rows, with base_n + confidence.
 * @returns {StageStat}
 */
export function stageStat(rows, brand, stage) {
  const base_n = rows.length
  const count = countStage(rows, brand, stage)
  return { pct: round1((100 * count) / base_n), count, base_n, low_confidence: lowConf(base_n) }
}

/**
 * Headline funnel: every brand × wave × stage as % of all respondents in the wave.
 * Mirrors analysed_outputs.funnel_by_brand_wave (verified to reproduce it exactly).
 * @returns {Record<string, Record<string, { aware: StageStat, consider: StageStat, used: StageStat, base_n: number }>>}
 */
export function funnelByBrandWave(raw) {
  const out = {}
  for (const b of brandsOf(raw)) {
    out[b] = {}
    for (const w of wavesOf(raw)) {
      const rows = rowsIn(raw, w)
      out[b][w] = { base_n: rows.length }
      for (const s of STAGES) out[b][w][s] = stageStat(rows, b, s)
    }
  }
  return out
}

/**
 * Wave deltas: later wave − earlier wave, in percentage points, per brand/stage.
 * Mirrors analysed_outputs.wave_deltas.
 */
export function waveDeltas(raw) {
  const [w0, w1] = wavesOf(raw)
  const f = funnelByBrandWave(raw)
  const out = {}
  for (const b of brandsOf(raw)) {
    out[b] = {}
    for (const s of STAGES) out[b][s] = round1(f[b][w1][s].pct - f[b][w0][s].pct)
  }
  return out
}

/**
 * Conditional conversion — the funnel-leak diagnostic the provided outputs omit.
 * consider|aware (consideration rate among the aware) and used|consider (trial rate among
 * considerers). Base = the conditioning set, so confidence keys off that.
 * @returns {Record<string, Record<string, { consider_given_aware: Conversion, used_given_consider: Conversion }>>}
 */
export function conditionalConversion(raw) {
  const conv = (rows, brand, num, den) => {
    const numerator = countStage(rows, brand, num)
    const denominator = countStage(rows, brand, den)
    return {
      rate: denominator ? round1((100 * numerator) / denominator) : null,
      numerator,
      denominator,
      low_confidence: lowConf(denominator),
    }
  }
  const out = {}
  for (const b of brandsOf(raw)) {
    out[b] = {}
    for (const w of wavesOf(raw)) {
      const rows = rowsIn(raw, w)
      out[b][w] = {
        consider_given_aware: conv(rows, b, 'consider', 'aware'),
        used_given_consider: conv(rows, b, 'used', 'consider'),
      }
    }
  }
  return out
}

/**
 * Gap-to-leader: for each wave/stage, every brand's distance (pp) from the stage leader, and
 * how that gap moved between waves. The competitive-distance framing for the headline viz.
 */
export function gapToLeader(raw) {
  const f = funnelByBrandWave(raw)
  const brands = brandsOf(raw)
  const waves = wavesOf(raw)
  const out = {}
  for (const w of waves) {
    out[w] = {}
    for (const s of STAGES) {
      const leader = brands.reduce((a, b) => (f[b][w][s].pct > f[a][w][s].pct ? b : a), brands[0])
      out[w][s] = { leader }
      for (const b of brands) out[w][s][b] = round1(f[b][w][s].pct - f[leader][w][s].pct)
    }
  }
  // gap movement (later − earlier) per brand/stage; negative = gap widened against the leader
  const [w0, w1] = waves
  const movement = {}
  for (const b of brands) {
    movement[b] = {}
    for (const s of STAGES) movement[b][s] = round1(out[w1][s][b] - out[w0][s][b])
  }
  return { by_wave: out, movement }
}

/**
 * Share of consideration (and of usage): a brand's count at a stage as a share of all brands'
 * counts at that stage — a category-share lens complementing the absolute funnel.
 */
export function shareOfStage(raw, stage = 'consider') {
  const brands = brandsOf(raw)
  const out = {}
  for (const w of wavesOf(raw)) {
    const rows = rowsIn(raw, w)
    const counts = Object.fromEntries(brands.map((b) => [b, countStage(rows, b, stage)]))
    const total = Object.values(counts).reduce((a, c) => a + c, 0)
    out[w] = Object.fromEntries(brands.map((b) => [b, total ? round1((100 * counts[b]) / total) : null]))
  }
  return out
}

/**
 * Generic demographic cut: a brand's stage stat per value of a dimension (age_band, gender),
 * each with base_n + low_confidence. This is where most cells go thin — the flag is the point.
 */
export function stageByDimension(raw, brand, stage, dimension, wave) {
  const rows = wave ? rowsIn(raw, wave) : raw
  const values = [...new Set(rows.map((r) => r[dimension]))].sort()
  const out = {}
  for (const v of values) out[v] = stageStat(rows.filter((r) => r[dimension] === v), brand, stage)
  return out
}

/**
 * Mix-adjusted (directly standardized) delta: re-weight `compareWave` to `refWave`'s mix over
 * `dimension`, isolating real movement from sample-composition artefact. Returns the raw delta,
 * the standardized delta, and the artefact (raw − standardized). For the unweighted-sample trap.
 */
export function mixAdjustedDelta(raw, brand, stage, { dimension = 'age_band', refWave, compareWave } = {}) {
  const waves = wavesOf(raw)
  const ref = refWave ?? waves[0]
  const cmp = compareWave ?? waves[1]
  const refRows = rowsIn(raw, ref)
  const cmpRows = rowsIn(raw, cmp)
  const values = [...new Set(raw.map((r) => r[dimension]))]
  const weight = (v) => refRows.filter((r) => r[dimension] === v).length / refRows.length
  const rawPct = (rows) => (100 * countStage(rows, brand, stage)) / rows.length

  let std = 0
  for (const v of values) {
    const cell = cmpRows.filter((r) => r[dimension] === v)
    if (cell.length) std += weight(v) * (100 * countStage(cell, brand, stage)) / cell.length
  }
  const rawDelta = rawPct(cmpRows) - rawPct(refRows)
  const stdDelta = std - rawPct(refRows)
  return {
    raw_delta: round1(rawDelta),
    standardized_delta: round1(stdDelta),
    artefact: round1(rawDelta - stdDelta),
    dimension,
    standardized_to: ref,
  }
}

/**
 * Competitive repertoire: among respondents who consider `brand` in a wave, how many other
 * brands they also consider, and pairwise overlap. Raw-only — invisible to the headline funnels.
 */
export function repertoire(raw, brand, wave) {
  const rows = rowsIn(raw, wave)
  const brands = brandsOf(raw)
  const considers = (b) => new Set(rows.filter((r) => r.brand_funnel[b].consider === true).map((r) => r.respondent_id))
  const sets = Object.fromEntries(brands.map((b) => [b, considers(b)]))
  const base = [...sets[brand]]
  const breadth = {}
  for (const id of base) {
    const n = brands.filter((b) => sets[b].has(id)).length
    breadth[n] = (breadth[n] || 0) + 1
  }
  const overlap = {}
  for (const b of brands) {
    if (b === brand) continue
    const both = base.filter((id) => sets[b].has(id)).length
    overlap[b] = { both, pct_of_base: base.length ? round1((100 * both) / base.length) : null }
  }
  const exclusive = base.filter((id) => brands.every((b) => b === brand || !sets[b].has(id))).length
  return {
    base_n: base.length,
    low_confidence: lowConf(base.length),
    breadth, // { "1": exclusive-count, "2": ..., ... } brands-considered including this one
    exclusive: { count: exclusive, pct_of_base: base.length ? round1((100 * exclusive) / base.length) : null },
    overlap,
  }
}

// ─────────────────────────────────────────────────────────────────────────────────────────
// LAYER 2 — cross-brand & efficiency lenses
//
// The headline funnel (layer 1) measures each brand's SIZE in isolation. This layer reframes
// the same raw data to answer questions size can't: is a brand's gap a reach problem or a
// preference problem (headToHead, rejectionRate), how efficiently does it pull demand through
// (pullThrough), is the category demand locked or up for grabs (contestedDemand), and what would
// closing a conversion gap be worth (opportunityIfMatched). These are the sharpest tools for the
// AI analyst — they are exposed as MCP tools, so each description below states what it answers,
// when to reach for it, its parameters, its return shape, and how to read the confidence flag.
//
// Convention for this layer: `wave` is an explicit, required argument and each call returns a
// flat snapshot for that one wave (e.g. "2026-Q1"). For a wave-on-wave shift, call twice and diff.
// ─────────────────────────────────────────────────────────────────────────────────────────

/**
 * HEAD-TO-HEAD on a level playing field. Restricts to respondents aware of BOTH brands, then
 * compares their consideration and usage rates within that set — removing the awareness gap so
 * you see preference, not reach.
 *
 * Use this to diagnose WHY a brand trails: if it nearly matches the rival here but trails in the
 * headline funnel, the gap is a REACH problem (too few people know it). If it also loses
 * head-to-head, the gap is a PREFERENCE/product problem. The single most decision-changing lens
 * for a challenger brand.
 *
 * @param {object[]} raw   - respondent records
 * @param {string} brandA  - the focus brand (e.g. "Aurora")
 * @param {string} brandB  - the rival (e.g. "Borealis")
 * @param {string} wave    - wave id, e.g. "2026-Q1"
 * @returns {{ base_n:number, low_confidence:boolean,
 *            consider:{ [brand:string]:number, gap:number },
 *            used:{ [brand:string]:number, gap:number } }}
 *   Rates are % of the aware-of-both set. `gap` is brandA − brandB (negative = A behind).
 *   `base_n` is the aware-of-both count; check `low_confidence` (true when base_n < 50).
 */
export function headToHead(raw, brandA, brandB, wave) {
  const both = rowsIn(raw, wave).filter(
    (r) => r.brand_funnel[brandA].aware === true && r.brand_funnel[brandB].aware === true,
  )
  const n = both.length
  const rate = (brand, stage) => (n ? round1((100 * countStage(both, brand, stage)) / n) : null)
  const block = (stage) => {
    const a = rate(brandA, stage)
    const b = rate(brandB, stage)
    return { [brandA]: a, [brandB]: b, gap: a == null || b == null ? null : round1(a - b) }
  }
  return { base_n: n, low_confidence: lowConf(n), consider: block('consider'), used: block('used') }
}

/**
 * REJECTION RATE — of the people who know the brand, the share who will NOT consider it
 * (aware === true but consider === false). The flip side of consider-given-aware: a measure of
 * how well-liked a brand is among those reached, independent of how many that is.
 *
 * Use it to separate "people don't know us" from "people know us and pass." A low rejection rate
 * close to the leader's means awareness is not being wasted on a disliked brand — supports a
 * reach-investment story.
 *
 * @param {object[]} raw - respondent records
 * @param {string} brand - brand to evaluate
 * @param {string} wave  - wave id
 * @returns {{ rate:number|null, rejecters:number, base_n:number, low_confidence:boolean }}
 *   `rate` = % of aware who won't consider (lower = better-liked). `base_n` = aware count.
 */
export function rejectionRate(raw, brand, wave) {
  const rows = rowsIn(raw, wave)
  const aware = countStage(rows, brand, 'aware')
  const rejecters = aware - countStage(rows, brand, 'consider')
  return {
    rate: aware ? round1((100 * rejecters) / aware) : null,
    rejecters,
    base_n: aware,
    low_confidence: lowConf(aware),
  }
}

/**
 * PULL-THROUGH — end-to-end efficiency: of everyone aware of the brand, the share who have
 * actually used it (used | aware). Two brands with equal awareness can have very different
 * pull-through; this ranks brands by how well they convert reach into usage, not by raw size.
 *
 * Use it to characterise a brand's funnel as efficient vs leaky, and to compare efficiency
 * archetypes across the field.
 *
 * @param {object[]} raw - respondent records
 * @param {string} brand - brand to evaluate
 * @param {string} wave  - wave id
 * @returns {{ rate:number|null, used:number, base_n:number, low_confidence:boolean }}
 *   `rate` = % of aware who have used it. `base_n` = aware count.
 */
export function pullThrough(raw, brand, wave) {
  const rows = rowsIn(raw, wave)
  const aware = countStage(rows, brand, 'aware')
  const used = countStage(rows, brand, 'used')
  return {
    rate: aware ? round1((100 * used) / aware) : null,
    used,
    base_n: aware,
    low_confidence: lowConf(aware),
  }
}

/**
 * CONTESTED DEMAND & market structure for a wave. Of everyone who considers at least one brand,
 * how much demand is "contested" (the person considers 2+ brands and could switch) vs "locked"
 * (committed to exactly one), plus the average breadth of awareness/consideration per person.
 * No brand argument — this describes the whole category.
 *
 * Use it to gauge how competitive/switchable the market is and whether it is heating up over time
 * (compare two waves): rising contested share means demand is increasingly up for grabs.
 *
 * @param {object[]} raw - respondent records
 * @param {string} wave  - wave id
 * @returns {{ considerer_base:number, contested_pct:number|null, locked_pct:number|null,
 *            avg_brands_aware:number, avg_brands_considered:number }}
 *   Percentages are of respondents who consider ≥1 brand. `considerer_base` is solid (~250-scale).
 */
export function contestedDemand(raw, wave) {
  const rows = rowsIn(raw, wave)
  const brands = brandsOf(raw)
  const considered = (r) => brands.filter((b) => r.brand_funnel[b].consider === true).length
  const awareCount = (r) => brands.filter((b) => r.brand_funnel[b].aware === true).length
  const considerers = rows.filter((r) => considered(r) >= 1)
  const contested = considerers.filter((r) => considered(r) >= 2).length
  const n = considerers.length
  const avg = (fn, set) => +(set.reduce((a, r) => a + fn(r), 0) / set.length).toFixed(2)
  return {
    considerer_base: n,
    contested_pct: n ? round1((100 * contested) / n) : null,
    locked_pct: n ? round1((100 * (n - contested)) / n) : null,
    avg_brands_aware: avg(awareCount, rows),
    avg_brands_considered: avg(considered, rows),
  }
}

/**
 * OPPORTUNITY IF MATCHED — a labelled SCENARIO, not an observed metric. Projects what `brand`'s
 * usage (% of all respondents) would be IF it converted consideration→usage at `benchmarkBrand`'s
 * rate, holding its consideration fixed. Sizes the prize of fixing a lower-funnel leak.
 *
 * ⚠️ The result is a counterfactual projection grounded in real rates, NOT a measured fact. The
 * return is flagged `is_projection: true` and carries its `assumption` so any UI/answer presents
 * it as a what-if, never as data. (DESIGN.md: no invented figures presented as observed.)
 *
 * @param {object[]} raw          - respondent records
 * @param {string} brand          - brand to improve (e.g. "Aurora")
 * @param {string} benchmarkBrand - brand whose conversion rate to borrow (e.g. "Borealis")
 * @param {string} wave           - wave id
 * @returns {{ is_projection:true, assumption:string, current_used_pct:number,
 *            benchmark_conversion:number, projected_used_pct:number, projected_lift_pp:number }}
 */
export function opportunityIfMatched(raw, brand, benchmarkBrand, wave) {
  const rows = rowsIn(raw, wave)
  const n = rows.length
  const considerPct = round1((100 * countStage(rows, brand, 'consider')) / n)
  const currentUsedPct = round1((100 * countStage(rows, brand, 'used')) / n)
  const bConsider = countStage(rows, benchmarkBrand, 'consider')
  const benchConversion = bConsider ? round1((100 * countStage(rows, benchmarkBrand, 'used')) / bConsider) : null
  const projected = benchConversion == null ? null : round1((considerPct * benchConversion) / 100)
  return {
    is_projection: true,
    assumption: `${brand} keeps its ${considerPct}% consideration but converts to usage at ${benchmarkBrand}'s ${benchConversion}% rate (vs its own current rate)`,
    current_used_pct: currentUsedPct,
    benchmark_conversion: benchConversion,
    projected_used_pct: projected,
    projected_lift_pp: projected == null ? null : round1(projected - currentUsedPct),
  }
}
