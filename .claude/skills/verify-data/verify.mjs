#!/usr/bin/env node
// verify-data — recompute every brand-funnel metric from data/responses_raw.json and
// assert it matches data/analysed_outputs.json, then check the funnel invariants.
// Exit 0 = everything reproduces. Exit 1 = at least one mismatch or violation.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const read = (p) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const raw = read('data/responses_raw.json')
const out = read('data/analysed_outputs.json')

// Round half-to-even at 1 decimal, matching the Python that produced analysed_outputs.
// (Plain Math.round would turn 31.25 into 31.3; the source rounds it to 31.2.)
const round1 = (x) => {
  const scaled = x * 10
  const floor = Math.floor(scaled)
  const diff = scaled - floor
  let r
  if (Math.abs(diff - 0.5) < 1e-9) r = floor % 2 === 0 ? floor : floor + 1
  else r = Math.round(scaled)
  return r / 10
}

const waves = [...new Set(raw.map((r) => r.wave))].sort()
const brands = [out.meta.tracker_brand, ...out.meta.competitors]
const stages = ['aware', 'consider', 'used']
const inWave = (w) => raw.filter((r) => r.wave === w)

let failures = 0
const fail = (m) => { console.error('  ✗ ' + m); failures++ }
const ok = (m) => console.log('  ✓ ' + m)

// 1. Funnels — numerator counts only `=== true`; denominator is all respondents in the wave.
console.log('Funnels (% of all respondents in wave):')
const pct = {}
for (const b of brands) {
  pct[b] = {}
  for (const w of waves) {
    const rs = inWave(w)
    const n = rs.length
    pct[b][w] = {}
    let allOk = true
    for (const s of stages) {
      const c = rs.filter((r) => r.brand_funnel[b][s] === true).length
      const p = round1((100 * c) / n)
      pct[b][w][s] = p
      const exp = out.funnel_by_brand_wave[b][w][`${s}_pct`]
      if (p !== exp) { fail(`${b} ${w} ${s}_pct: got ${p}, expected ${exp}`); allOk = false }
    }
    const expN = out.funnel_by_brand_wave[b][w].base_n
    if (n !== expN) { fail(`${b} ${w} base_n: got ${n}, expected ${expN}`); allOk = false }
    if (allOk) ok(`${b} ${w}: ${pct[b][w].aware}/${pct[b][w].consider}/${pct[b][w].used} (n=${n})`)
  }
}

// 2. Wave deltas — Q1 minus Q4, in percentage points.
console.log('\nWave deltas (Q1 − Q4, pp):')
const [w0, w1] = waves
for (const b of brands) {
  let allOk = true
  for (const s of stages) {
    const d = round1(pct[b][w1][s] - pct[b][w0][s])
    const exp = out.wave_deltas[b][`${s}_delta`]
    if (d !== exp) { fail(`${b} ${s}_delta: got ${d}, expected ${exp}`); allOk = false }
  }
  if (allOk) {
    const d = (s) => round1(pct[b][w1][s] - pct[b][w0][s])
    ok(`${b}: Δaware ${d('aware')}, Δconsider ${d('consider')}, Δused ${d('used')}`)
  }
}

// 3. Aurora consider% by age band — flags thin bases (n < 50).
console.log('\nAurora consider% by age band:')
for (const w of waves) {
  for (const [band, exp] of Object.entries(out.aurora_consider_by_age[w])) {
    const rs = inWave(w).filter((r) => r.age_band === band)
    const n = rs.length
    const c = rs.filter((r) => r.brand_funnel.Aurora.consider === true).length
    const p = round1((100 * c) / n)
    if (p !== exp.consider_pct || n !== exp.base_n) {
      fail(`Aurora ${w} ${band}: got ${p}% (n=${n}), expected ${exp.consider_pct}% (n=${exp.base_n})`)
    } else {
      ok(`${w} ${band}: ${p}% (n=${n})${n < 50 ? '  ⚠ n<50 (low-confidence)' : ''}`)
    }
  }
}

// 4. Invariants — null-nesting, the four legal states, and aware ≥ consider ≥ used.
console.log('\nInvariants:')
let nestViolations = 0
const states = new Set()
for (const r of raw) {
  for (const b of brands) {
    const { aware, consider, used } = r.brand_funnel[b]
    states.add(`(${aware}, ${consider}, ${used})`)
    if (aware !== true && consider !== null) nestViolations++
    if (consider !== true && used !== null) nestViolations++
  }
}
nestViolations === 0
  ? ok('null-nesting holds (consider null unless aware===true; used null unless consider===true)')
  : fail(`null-nesting violated in ${nestViolations} cell(s)`)
states.size === 4
  ? ok(`exactly 4 funnel states observed: ${[...states].join('  ')}`)
  : fail(`expected 4 funnel states, saw ${states.size}: ${[...states].join('  ')}`)

let monoOk = true
for (const b of brands) for (const w of waves) {
  const f = pct[b][w]
  if (!(f.aware >= f.consider && f.consider >= f.used)) { fail(`${b} ${w}: aware≥consider≥used violated`); monoOk = false }
}
if (monoOk) ok('aware ≥ consider ≥ used holds for every brand/wave')

console.log('')
if (failures === 0) {
  console.log('✅ All metrics reproduce from raw and all invariants hold.')
  process.exit(0)
}
console.error(`❌ ${failures} check(s) failed.`)
process.exit(1)
