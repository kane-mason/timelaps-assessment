'use client'

import { useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import type { RaceLane } from '@/lib/funnel/page-data'
import { StageIcon } from '@/components/funnel/StageIcon'

// Section 01 — the connected race. Two businesses joined by the gap line; on scroll-into-view
// both dots roll from last quarter to now and the line stretches/contracts, colouring in.
// Framer Motion's useInView drives the trigger; the motion itself is the CSS keyframes from
// globals.css (the approved mockup behaviour), with a remount key for Replay.
const laneVars = (p: RaceLane['pos']): React.CSSProperties =>
  ({
    '--aw': `${p.aw}%`, '--an': `${p.an}%`,
    '--bw': `${p.bw}%`, '--bn': `${p.bn}%`,
    '--bwR': `${p.bwR}%`, '--bnR': `${p.bnR}%`,
    '--mid': `${p.mid}%`,
  }) as React.CSSProperties

export function ConnectedRace({ lanes }: { lanes: RaceLane[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.3 })
  const [replay, setReplay] = useState(0)

  return (
    <>
      <div className="chapter sec1-head">
        <div>
          <div className="ch-kick">
            <b>01</b> &nbsp;·&nbsp; The gap to the leader
          </div>
          <div className="ch-title">Aurora&apos;s gap to Borealis is splitting in two</div>
          <div className="ch-read">
            Each line joins <b>Aurora</b> to the leader <b>Borealis</b> (★) — the gap at that stage.
            Both moved since last quarter; the line <b>stretches</b> where Borealis pulls ahead and{' '}
            <b>shrinks</b> where Aurora closes in, colouring red (widening) or green (narrowing) as it
            settles. Each lane is zoomed to its own range.
          </div>
        </div>
        <button className="replay" onClick={() => setReplay((n) => n + 1)}>
          ▸ Replay
        </button>
      </div>

      <div ref={ref}>
        <div key={replay} className={`race${inView ? ' play' : ''}`}>
          {lanes.map((l) => (
            <div key={l.key} className={`lane ${l.narrowed ? 'narrow' : 'widen'}`} style={laneVars(l.pos)}>
              <div className="lane-stage">
                <StageIcon stage={l.key} />
                {l.label}
              </div>
              <div className="track">
                <div className="link" />
                <div className="dot d-aur" />
                <div className="dot d-bor">★</div>
                <span className="tag aur">AURORA</span>
                <span className="tag bor">BOREALIS</span>
                <span className="val aur">{l.auroraNow}%</span>
                <span className="val bor">{l.borealisNow}%</span>
                <span className="gaplab">{l.narrowed ? `◂ ${l.gapNow} behind` : `${l.gapNow} behind ▸`}</span>
              </div>
              <div className="verdict">
                <div className="v">{l.verdict}</div>
                <div className="s">{l.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
