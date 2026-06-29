import { ConnectedRace } from '@/components/funnel/ConnectedRace'
import { getPageData } from '@/lib/funnel/page-data'

export default function Page() {
  const { race, standings, diagnosis } = getPageData()

  return (
    <>
      {/* INTRO */}
      <div className="eyebrow">Brand tracker · South Africa · Q1 2026</div>
      <div className="title">Aurora&apos;s Competitive Funnel Position</div>
      <div className="sub">Q1 2026 vs Q4 2025 · Aurora vs Borealis, Cascade and Drift</div>
      <h1 className="headline">
        Aurora is the clear <span className="hi">#2</span> —{' '}
        <span className="win">closing on Borealis in consideration</span>, but{' '}
        <span className="lose">losing ground</span> in awareness and usage.
      </h1>
      <p className="subhead">
        Look closer and the gap is <b>reach + trial, not preference</b> — once people know Aurora, it
        competes.
      </p>

      {/* 01 — THE GAP (connected race, client/animated) */}
      <ConnectedRace lanes={race} />

      {/* 02 — THE STANDINGS */}
      <div className="chapter">
        <div className="ch-kick">
          <b>02</b> &nbsp;·&nbsp; The standings
        </div>
        <div className="ch-title">Aurora is the clear #2 — behind Borealis, ahead of the rest</div>
        <div className="ch-read">
          All four brands at each stage, ranked. Aurora is highlighted; Borealis carries the green ★
          as category leader. Bars are scaled within a stage to that leader.
        </div>
      </div>
      <div className="legend">
        <span><span className="lg" style={{ background: 'var(--focus)' }} />Aurora (you)</span>
        <span><span className="star" style={{ fontSize: 12 }}>★</span>Leader</span>
        <span><span className="lg" style={{ background: 'var(--dim)' }} />Others</span>
      </div>
      <div className="stages3">
        {standings.map((col) => (
          <div className="scol" key={col.key}>
            <div className="sc-head">
              <span className="sdot" style={{ background: col.color }} />
              <div>
                <div className="sc-name">{col.label}</div>
                <div className="sc-desc">{col.desc}</div>
              </div>
            </div>
            {col.rows.map((row) => (
              <div
                key={row.brand}
                className={`row${row.isAurora ? ' me' : ''}${row.isLeader ? ' lead' : ''}`}
              >
                <div className="row-top">
                  <span className="rk">{row.rank}</span>
                  <span className="bn">
                    {row.isLeader && <span className="star">★</span>}
                    {row.brand}
                    {row.isAurora && <span className="you">YOU</span>}
                  </span>
                  <span className="vv num">{row.pct}%</span>
                </div>
                <div className="bar">
                  <i style={{ width: `${row.barPct}%` }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 03 — THE DIAGNOSIS */}
      <div className="chapter">
        <div className="ch-kick">
          <b>03</b> &nbsp;·&nbsp; The diagnosis
        </div>
        <div className="ch-title">So why is Aurora behind? Not because people dislike it</div>
        <div className="ch-read">
          Two simple checks: do the people who know Aurora reject it — and where exactly does it lose
          them?
        </div>
      </div>
      <div className="diag">
        <div className="dp reach">
          <div className="dp-tag">● The good news</div>
          <h3>People who know Aurora rate it.</h3>
          <div className="ctx">
            Look only at people who know <b>both</b> brands. Almost as many would consider Aurora as
            Borealis:
          </div>
          <div className="h2h">
            <div className="lbl"><span>Would consider</span></div>
            <div className="vs">
              <div className="b me">
                <i style={{ width: `${diagnosis.h2hConsiderAurora}%` }} />
                <span className="nm">Aurora</span>
                <span className="pct" style={{ color: 'var(--focus-deep)' }}>{diagnosis.h2hConsiderAurora}%</span>
              </div>
              <div className="b them">
                <i style={{ width: `${diagnosis.h2hConsiderBorealis}%` }} />
                <span className="nm">Borealis ★</span>
                <span className="pct" style={{ color: '#4B5246' }}>{diagnosis.h2hConsiderBorealis}%</span>
              </div>
            </div>
          </div>
          <div className="callout">
            <b>Neck and neck.</b> So the problem isn&apos;t that people dislike Aurora — it&apos;s that
            fewer people <i>know</i> it. Get it in front of them and it competes.
          </div>
        </div>

        <div className="dp trial">
          <div className="dp-tag">● The problem</div>
          <h3>But fewer of them actually buy.</h3>
          <div className="ctx">
            Of the people who <i>would</i> consider each brand, how many go on to buy it:
          </div>
          <div className="h2h">
            <div className="lbl"><span>Go on to buy</span></div>
            <div className="vs">
              <div className="b me">
                <i style={{ width: `${diagnosis.convAurora}%` }} />
                <span className="nm">Aurora</span>
                <span className="pct" style={{ color: 'var(--focus-deep)' }}>{diagnosis.convAurora}%</span>
              </div>
              <div className="b them">
                <i style={{ width: `${diagnosis.convBorealis}%` }} />
                <span className="nm">Borealis ★</span>
                <span className="pct" style={{ color: '#4B5246' }}>{diagnosis.convBorealis}%</span>
              </div>
            </div>
          </div>
          <div className="women">
            This is worst with <b>women</b>, where Aurora trails Borealis by the widest margin.
          </div>
          <div className="callout">
            <b>That&apos;s the leak</b> — Aurora loses people at the final step. Closing it would lift
            usage by about <b>+4 points</b>. <i>Projection.</i>
          </div>
        </div>
      </div>

      {/* 04 — THE TAKEAWAY */}
      <div className="chapter">
        <div className="ch-kick">
          <b>04</b> &nbsp;·&nbsp; The takeaway
        </div>
        <div className="ch-title">What to do about it</div>
      </div>
      <div className="takes">
        <div className="tk">
          <div className="n">01 — Hold</div>
          <h5>A strong, well-liked #2</h5>
          <p>Clear of Cascade and Drift, demand as loyal as the leader&apos;s.</p>
        </div>
        <div className="tk">
          <div className="n">02 — Buy</div>
          <h5>Awareness</h5>
          <p>The gap is mostly reach — once people know Aurora, it competes.</p>
        </div>
        <div className="tk">
          <div className="n">03 — Fix</div>
          <h5>Turn interest into sales</h5>
          <p>
            Help the people who already like Aurora actually buy it — especially women. Worth about 4
            more buyers in every 100.
          </p>
        </div>
      </div>

      <div className="foot">
        Gap = points behind Borealis · head-to-head on n=115 aware of both · bars in standings scaled
        within each stage (leader = full) · % of all surveyed · 250/wave · unweighted
      </div>
    </>
  )
}
