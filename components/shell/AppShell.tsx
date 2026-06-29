'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const FunnelIcon = () => (
  <svg className="ic" viewBox="0 0 24 24"><path d="M3 5h18l-7 8v6l-4 2v-8z" /></svg>
)
const SparkIcon = () => (
  <svg className="ic" viewBox="0 0 24 24"><path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" /></svg>
)
const GearIcon = () => (
  <svg className="ic" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </svg>
)

const NAV = [
  { href: '/', label: 'Competitive Funnel', Icon: FunnelIcon },
  { href: '/analyst', label: 'AI Analyst', Icon: SparkIcon },
]

const TITLES: Record<string, string> = {
  '/': 'Competitive Funnel',
  '/analyst': 'AI Analyst',
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const title = TITLES[path] ?? 'Dashboard'

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">T</div>
          <div>
            <div className="brand-name">Timelaps</div>
            <div className="brand-sub">Brand Tracker</div>
          </div>
        </div>

        <div className="nav-label">Analysis</div>
        <nav>
          {NAV.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className={`nav-item${path === href ? ' active' : ''}`}>
              <Icon />
              {label}
            </Link>
          ))}
        </nav>

        <div className="nav-label">Workspace</div>
        <nav>
          <span className="nav-item disabled"><GearIcon />Settings</span>
        </nav>

        <div className="sidebar-foot">
          <div className="avatar">AU</div>
          <div>
            <div className="who">Aurora team</div>
            <div className="who-sub">South Africa</div>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="crumb">
            Brand Tracker <span className="sep">/</span> <b>{title}</b>
          </div>
          <div className="wave-pill"><span className="dot" /> Q1 2026</div>
        </header>
        <main className="app-inner">{children}</main>
      </div>
    </div>
  )
}
