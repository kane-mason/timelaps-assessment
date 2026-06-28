# AGENTS.md

Guide for AI agents (Claude Code, Cursor, …) working in this repo. **Read this first.**

## What this is

The Timelaps founding-engineer technical exercise — full brief in
[docs/brief/exercise.md](docs/brief/exercise.md). Two deliverables plus a walkthrough video:

- **Part 1** *(the bulk)* — a decision-ready data-viz component: **Aurora** vs competitors
  (Borealis, Cascade, Drift) on the brand funnel (aware → consider → used), and how the
  competitive picture shifted **Q4 2025 → Q1 2026**. Notes in [docs/part1/](docs/part1/).
- **Part 2** *(design; code optional)* — how to build an AI analyst over the same data:
  NL question → analysis grounded in the real numbers → plain-language answer + viz. Notes
  in [docs/part2/](docs/part2/).

Both parts are planned to ship on **one Next.js site**; app code will live at the repo
root (not yet scaffolded).

## Repo layout

| Path | What |
|---|---|
| `data/` | Provided datasets the app consumes (`responses_raw.json`, `analysed_outputs.json`). |
| `docs/` | Brief, verified data profile, and per-part design notes. |
| `.claude/`, `.cursor/`, `.mcp.json` | Agent tooling — skills, rules, MCP servers. |
| `internal/` | **Private. Off-limits — see below.** |

## ⚠️ `internal/` is off-limits

`internal/` is gitignored and holds private planning notes that reference external/personal
context. **Never read it into shared output, commit it, or reference it in the deliverable.**
The source may be shared with assessors — keep everything outside `internal/` clean of it.
Only open it if the user explicitly asks.

## The data contract (get this right, or the numbers are wrong)

Verified source of truth: [docs/data-profile.md](docs/data-profile.md). The essentials:

- **`null` means "not asked", never `false`.** The survey skips `consider` unless
  `aware === true`, and `used` unless `consider === true`. Count a stage **only where the
  value is `=== true`**.
- **Stages nest:** `aware ≥ consider ≥ used`, always.
- **Percentages are of ALL respondents in the wave** (denominator ≈ 250), not % of aware.
- **`n < 50` is low-confidence** — flag it. The 50+ band, `nonbinary`, `prefer_not_say`,
  and most sub-funnel cells are thin.
- **The sample is unweighted and its demographic mix shifts between waves** — so part of any
  wave-on-wave delta is sample-mix artefact, not real brand movement. Say so when it matters.

Before trusting a computed number, run the verification skill — it recomputes every metric
from raw and asserts it matches the pre-computed outputs:

```bash
node .claude/skills/verify-data/verify.mjs    # or the /verify-data skill in Claude Code
```

## Stack

Becomes a **Next.js app at the repo root** once Part 1's build approach is locked. This
section will grow with real conventions once code exists — until then, don't assume a
framework or chart-library choice that hasn't been made.

## GitHub operations

**Always prefer the GitHub MCP server** for GitHub work (PRs, issues, reviews, repo/branch
management, API queries). If it's unavailable (server down, tools not exposed, auth
failing), fall back without blocking — in order:

1. `git` over SSH (this repo's `origin` uses the `git@github-personal:` alias).
2. The `gh` CLI, if installed.
3. Web fetch / manual instructions as a last resort.

Note which fallback you used so the choice is visible.
