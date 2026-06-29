// A little colour-coded icon-badge for a funnel stage (aware / consider / used), reused across
// the page. The glyph differentiates the stage on top of colour — eye (seen it), magnifier
// (weighing it up), check (bought it) — so the colour is never the only cue.
import type { ReactNode } from 'react'

const GLYPHS: Record<string, ReactNode> = {
  aware: (
    <>
      <path d="M1.2 8s2.6-4.8 6.8-4.8S14.8 8 14.8 8s-2.6 4.8-6.8 4.8S1.2 8 1.2 8z" />
      <circle cx="8" cy="8" r="2.1" />
    </>
  ),
  consider: (
    <>
      <circle cx="6.8" cy="6.8" r="4.2" />
      <path d="M10 10l3.4 3.4" />
    </>
  ),
  used: <path d="M3 8.4l3.3 3.3L13 4.6" />,
}

export function StageIcon({ stage }: { stage: string }) {
  return (
    <span className={`stage-ic ${stage}`} aria-hidden>
      <svg viewBox="0 0 16 16">{GLYPHS[stage]}</svg>
    </span>
  )
}
