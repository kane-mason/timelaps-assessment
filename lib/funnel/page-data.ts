// View model for the Part 1 page — every figure is computed from lib/metrics.mjs (the verified
// source of truth), so nothing on the page is hand-typed. Runs at build/request time on the server.
import raw from '@/data/responses_raw.json'
import { funnelByBrandWave, conditionalConversion, headToHead } from '@/lib/metrics.mjs'

const Q4 = '2025-Q4'
const Q1 = '2026-Q1'

const STAGES = [
  { key: 'aware', label: 'Awareness', desc: 'Have heard of it', color: 'var(--stage-aware)' },
  { key: 'consider', label: 'Consideration', desc: 'Would consider buying', color: 'var(--stage-consider)' },
  { key: 'used', label: 'Used', desc: 'Have bought or used', color: 'var(--stage-used)' },
] as const

const r0 = (n: number) => Math.round(n)
const r1 = (n: number) => Math.round(n * 10) / 10

export type RaceLane = {
  key: string
  label: string
  color: string
  auroraNow: number
  borealisNow: number
  gapNow: number
  narrowed: boolean
  verdict: string
  note: string
  /** CSS percentages: each lane normalized + truncated to its own value range so moves are visible. */
  pos: { aw: number; an: number; bw: number; bn: number; bwR: number; bnR: number; mid: number }
}

export type StandingRow = { brand: string; pct: number; rank: number; barPct: number; isAurora: boolean; isLeader: boolean }
export type StandingCol = { key: string; label: string; desc: string; color: string; rows: StandingRow[] }

/** Map a stage's four values onto an 8%–86% track, zoomed to [min−pad, max+pad]. */
function positions(aQ4: number, aQ1: number, bQ4: number, bQ1: number) {
  const vals = [aQ4, aQ1, bQ4, bQ1]
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const pad = Math.max(1.5, (max - min) * 0.13)
  const lo = min - pad
  const span = max + pad - lo
  const p = (v: number) => r1(8 + ((v - lo) / span) * 78)
  const aw = p(aQ4), an = p(aQ1), bw = p(bQ4), bn = p(bQ1)
  return { aw, an, bw, bn, bwR: r1(100 - bw), bnR: r1(100 - bn), mid: r1((an + bn) / 2) }
}

export function getPageData() {
  const f = funnelByBrandWave(raw)
  const conv = conditionalConversion(raw)
  const h2h = headToHead(raw, 'Aurora', 'Borealis', Q1)

  // 01 — the connected race (gap to leader, both moving)
  const race: RaceLane[] = STAGES.map((s) => {
    const aQ4 = f.Aurora[Q4][s.key].pct as number
    const aQ1 = f.Aurora[Q1][s.key].pct as number
    const bQ4 = f.Borealis[Q4][s.key].pct as number
    const bQ1 = f.Borealis[Q1][s.key].pct as number
    const gapNow = r0(bQ1 - aQ1)
    const narrowed = bQ1 - aQ1 < bQ4 - aQ4
    return {
      key: s.key,
      label: s.label,
      color: s.color,
      auroraNow: r0(aQ1),
      borealisNow: r0(bQ1),
      gapNow,
      narrowed,
      verdict: narrowed ? '◂ Gap narrowed' : '▸ Gap widened',
      note: narrowed ? 'Aurora closed in — bright spot' : 'Borealis pulled ahead',
      pos: positions(aQ4, aQ1, bQ4, bQ1),
    }
  })

  // 02 — the standings (all brands per stage, ranked, scaled within stage to the leader)
  const brands = Object.keys(f)
  const standings: StandingCol[] = STAGES.map((s) => {
    const ranked = brands
      .map((b) => ({ brand: b, pct: f[b][Q1][s.key].pct as number }))
      .sort((a, b) => b.pct - a.pct)
    const leaderPct = ranked[0].pct
    return {
      key: s.key,
      label: s.label,
      desc: s.desc,
      color: s.color,
      rows: ranked.map((row, i) => ({
        brand: row.brand,
        pct: r0(row.pct),
        rank: i + 1,
        barPct: r0((row.pct / leaderPct) * 100),
        isAurora: row.brand === 'Aurora',
        isLeader: i === 0,
      })),
    }
  })

  // 03 — the diagnosis
  const diagnosis = {
    h2hConsiderAurora: r0(h2h.consider.Aurora as number),
    h2hConsiderBorealis: r0(h2h.consider.Borealis as number),
    convAurora: r0(conv.Aurora[Q1].used_given_consider.rate as number),
    convBorealis: r0(conv.Borealis[Q1].used_given_consider.rate as number),
  }

  return { race, standings, diagnosis }
}
