# CLAUDE.md

The project guide for all agents lives in **[AGENTS.md](AGENTS.md) — read it first.** It
covers the brief, repo layout, the **data contract** (critical — `null` ≠ `false`, stage
nesting, `n < 50`, unweighted mix), the `internal/` privacy rule, and GitHub conventions.

Claude Code specifics:

- **`/verify-data`** — recomputes the funnel metrics from raw and checks them against the
  pre-computed outputs. Use it to keep numbers grounded (see `.claude/skills/verify-data/`).
- Skills and other Claude tooling live under `.claude/`.
