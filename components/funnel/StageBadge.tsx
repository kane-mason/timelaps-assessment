// A labelled, colour-coded badge for a funnel stage (aware / consider / used). Reused across
// the page so the same stage reads identically everywhere — the colour is never on its own.
export function StageBadge({ stage, label }: { stage: string; label: string }) {
  return (
    <span className={`badge ${stage}`}>
      <span className="bd" />
      {label}
    </span>
  )
}
