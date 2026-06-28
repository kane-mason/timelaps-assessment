# AGENTS.md

## GitHub operations

**Always prefer the GitHub MCP server** for any GitHub interaction — pull requests, issues, reviews, repo/branch management, and API queries. Reach for the `github` MCP tools first.

**If the GitHub MCP is unavailable** — the server isn't running, its tools aren't exposed, or its token/auth is failing — **fall back to other methods** rather than blocking or asking. In order of preference:

1. `git` over SSH (this repo's `origin` uses the `git@github-personal:` alias).
2. The `gh` CLI, if installed.
3. Web fetch / manual instructions as a last resort.

Note the fallback you used so the choice is visible.
