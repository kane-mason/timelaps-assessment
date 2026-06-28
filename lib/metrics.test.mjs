// Verification test for the metrics module. Two jobs:
//   1. Grounding — assert lib/metrics reproduces the PROVIDED analysed_outputs.json to the
//      decimal, and the funnel invariants hold. This is the data contract, locked in CI.
//   2. Regression — pin the DERIVED metrics (conversion, gap-to-leader, mix-adjustment, …) to
//      the values hand-verified in docs/part1/derived-metrics.md, so they can't silently drift.
//
// Run: node --test lib/   (zero dependencies; ports straight to Vitest once the app exists.)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import {
  STAGES, brandsOf, wavesOf, funnelByBrandWave, waveDeltas, conditionalConversion,
  gapToLeader, shareOfStage, stageByDimension, mixAdjustedDelta, repertoire,
} from './metrics.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const raw = read('data/responses_raw.json')
const out = read('data/analysed_outputs.json')

const Q4 = '2025-Q4'
const Q1 = '2026-Q1'

// ── 1. Grounding: module reproduces the provided outputs ────────────────────────────────
test('funnels reproduce analysed_outputs to the decimal', () => {
  const f = funnelByBrandWave(raw)
  for (const b of brandsOf(raw)) {
    for (const w of wavesOf(raw)) {
      const exp = out.funnel_by_brand_wave[b][w]
      for (const s of STAGES) assert.equal(f[b][w][s].pct, exp[`${s}_pct`], `${b} ${w} ${s}_pct`)
      assert.equal(f[b][w].base_n, exp.base_n, `${b} ${w} base_n`)
    }
  }
})

test('wave deltas reproduce analysed_outputs', () => {
  const d = waveDeltas(raw)
  for (const b of brandsOf(raw))
    for (const s of STAGES) assert.equal(d[b][s], out.wave_deltas[b][`${s}_delta`], `${b} ${s}_delta`)
})

test('Aurora consider-by-age reproduces analysed_outputs (pct + base_n)', () => {
  for (const w of wavesOf(raw)) {
    const cut = stageByDimension(raw, 'Aurora', 'consider', 'age_band', w)
    for (const [band, exp] of Object.entries(out.aurora_consider_by_age[w])) {
      assert.equal(cut[band].pct, exp.consider_pct, `Aurora ${w} ${band} pct`)
      assert.equal(cut[band].base_n, exp.base_n, `Aurora ${w} ${band} base_n`)
    }
  }
})

// ── 2. Invariants ───────────────────────────────────────────────────────────────────────
test('null-nesting holds and exactly 4 funnel states occur', () => {
  const states = new Set()
  let violations = 0
  for (const r of raw)
    for (const b of brandsOf(raw)) {
      const { aware, consider, used } = r.brand_funnel[b]
      states.add(`(${aware}, ${consider}, ${used})`)
      if (aware !== true && consider !== null) violations++
      if (consider !== true && used !== null) violations++
    }
  assert.equal(violations, 0, 'null-nesting violations')
  assert.equal(states.size, 4, `funnel states: ${[...states].join(' ')}`)
})

test('aware ≥ consider ≥ used for every brand/wave', () => {
  const f = funnelByBrandWave(raw)
  for (const b of brandsOf(raw))
    for (const w of wavesOf(raw)) {
      const x = f[b][w]
      assert.ok(x.aware.pct >= x.consider.pct && x.consider.pct >= x.used.pct, `${b} ${w}`)
    }
})

// ── 3. Regression: derived metrics pinned to docs/part1/derived-metrics.md ───────────────
test('conditional conversion matches the verified figures', () => {
  const c = conditionalConversion(raw)
  assert.equal(c.Aurora[Q4].consider_given_aware.rate, 47.7)
  assert.equal(c.Aurora[Q1].consider_given_aware.rate, 52.3)
  assert.equal(c.Aurora[Q1].used_given_consider.rate, 48.1)
  assert.equal(c.Borealis[Q1].used_given_consider.rate, 59.8) // Borealis surges on trial
  assert.equal(c.Drift[Q1].used_given_consider.rate, 31.0) // Drift collapsing
})

test('gap-to-leader and its movement match the verified figures', () => {
  const g = gapToLeader(raw)
  for (const w of wavesOf(raw)) for (const s of STAGES) assert.equal(g.by_wave[w][s].leader, 'Borealis')
  assert.equal(g.by_wave[Q1].consider.Aurora, -8.4)
  assert.equal(g.by_wave[Q4].consider.Aurora, -10.0)
  assert.equal(g.movement.Aurora.consider, 1.6) // consideration gap narrowed
  assert.equal(g.movement.Aurora.aware, -8.8) // awareness gap widened
  assert.equal(g.movement.Aurora.used, -4.8) // usage gap widened
})

test('mix-adjusted deltas confirm the movements are real, not sample-mix artefact', () => {
  const age = mixAdjustedDelta(raw, 'Aurora', 'consider', { dimension: 'age_band' })
  assert.equal(age.raw_delta, 3.2)
  assert.equal(age.standardized_delta, 2.6) // survives age standardization
  assert.ok(Math.abs(age.artefact) < 1, 'age artefact under 1pt')
  const gen = mixAdjustedDelta(raw, 'Borealis', 'aware', { dimension: 'gender' })
  assert.ok(Math.abs(gen.artefact) < 1, 'Borealis aware gender artefact under 1pt')
})

test('share of consideration and repertoire match the verified figures', () => {
  assert.equal(shareOfStage(raw, 'consider')[Q1].Aurora, 31.0)
  const rep = repertoire(raw, 'Aurora', Q1)
  assert.equal(rep.base_n, 81)
  assert.equal(rep.exclusive.count, 39) // 48% consider Aurora exclusively
  assert.equal(rep.overlap.Borealis.both, 27)
})

// ── 4. Confidence flag is structural ─────────────────────────────────────────────────────
test('low_confidence flips exactly at base_n < 50', () => {
  const cut = stageByDimension(raw, 'Aurora', 'consider', 'age_band', Q4)
  assert.equal(cut['50+'].base_n, 16)
  assert.equal(cut['50+'].low_confidence, true)
  assert.equal(cut['25-34'].low_confidence, false) // band base 88 clears the rule
})
