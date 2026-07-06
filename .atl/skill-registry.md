# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| When creating a pull request, opening a PR, or preparing changes for review | branch-pr | ~/.config/opencode/skills/branch-pr/SKILL.md |
| When creating a GitHub issue, reporting a bug, or requesting a feature | issue-creation | ~/.config/opencode/skills/issue-creation/SKILL.md |
| When user says "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen" | judgment-day | ~/.config/opencode/skills/judgment-day/SKILL.md |
| When user asks to create a new skill, add agent instructions, or document patterns for AI | skill-creator | ~/.config/opencode/skills/skill-creator/SKILL.md |
| When user says "update skills", "skill registry", "actualizar skills", "update registry", or after installing/removing skills | skill-registry | ~/.config/opencode/skills/skill-registry/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### branch-pr
- Follow issue-first enforcement: every PR must link to a GitHub issue
- Use conventional commits (feat:, fix:, chore:, etc.)
- Never add "Co-Authored-By" or AI attribution to commits
- Before creating PR: inspect git status, diff, recent commits, and diff from base branch
- Review ALL commits included in the PR, not just the latest
- Use `gh` for GitHub tasks (PRs, issues, checks, releases)

### issue-creation
- Every change starts with a GitHub issue — no exceptions
- Use GitHub issue templates when available
- Include reproduction steps for bugs, acceptance criteria for features
- Label issues appropriately (bug, feature, enhancement)
- Reference issues in commits and PRs

### judgment-day
- Launches two independent blind judge sub-agents simultaneously
- Each judge reviews the same target without seeing the other's findings
- Synthesizes findings, applies fixes, re-judges until both pass or escalates after 2 iterations
- Use when user says "judgment day", "judgment-day", "review adversarial", "dual review"
- Judges must be truly independent — no shared context between them

### skill-creator
- Create skills when user asks to create a new skill, add agent instructions, or document patterns
- Follow the Agent Skills spec (frontmatter format, triggers, etc.)
- Skills must have clear trigger conditions in the description field
- Keep skills focused — one skill per concern
- Test skills by running them before publishing

### skill-registry
- Scan ALL skill directories (user-level and project-level)
- Skip `sdd-*`, `_shared`, and `skill-registry` itself
- Deduplicate by name (project-level wins over user-level)
- Generate compact rules (5-15 lines) for each skill
- Always write `.atl/skill-registry.md` regardless of SDD persistence mode
- Save to engram if available

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | ~/.config/opencode/AGENTS.md | Global agent rules (not project-level) |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.
