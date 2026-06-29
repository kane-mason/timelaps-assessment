export const metadata = { title: 'AI Analyst — Timelaps Brand Tracker' }

const EXAMPLES = [
  'Which age group is driving Aurora’s growth?',
  'Why did Aurora’s consideration move this quarter?',
  'Where is Aurora losing ground to Borealis?',
  'How loyal is Aurora’s demand vs the leader?',
]

export default function AnalystPage() {
  return (
    <>
      <div className="eyebrow">AI Analyst · Part 2</div>
      <h1 className="page-h1">Ask the data a question</h1>
      <p className="page-sub">
        Type a question in plain English. The analyst computes the answer from the same verified
        survey metrics that power the funnel view, then explains it in plain language with a chart —
        and flags any cut that sits on a small base. It reports numbers, never guesses them.
      </p>

      <div className="ask-box">
        <span className="q">e.g. Which age group is driving Aurora’s growth?</span>
        <span className="go">Ask</span>
      </div>

      <div className="examples">
        {EXAMPLES.map((q) => (
          <span className="exq" key={q}>{q}</span>
        ))}
      </div>

      <div className="stub-note">
        <b>Design in progress.</b> This is the Part 2 deliverable — the page that turns a natural-language
        question into analysis grounded in the real numbers. It will call the typed metric functions in{' '}
        <code>lib/metrics.mjs</code> as tools (head-to-head, conversion, gap-to-leader, base-size flags),
        so every answer is recomputed from the data and self-reports its confidence. Wiring it up is the
        next step.
      </div>
    </>
  )
}
