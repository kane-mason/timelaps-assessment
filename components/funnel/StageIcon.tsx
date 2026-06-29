// A small colour-coded square marking a funnel stage (aware / consider / used). Reused wherever
// a stage is referenced (race lanes, standings headers, diagnosis labels, action cards) so the
// same stage colour reads consistently across the page.
export function StageIcon({ stage, size }: { stage: string; size?: 'sm' }) {
  return <span className={`stage-ic${size === 'sm' ? ' sm' : ''} ${stage}`} aria-hidden />
}
