# Agent Team Playbook (Repo-Integrated)

**Default Team Lead:** GPT-5.2 Thinking  
**Opus 4.6:** nur für Ausnahmefälle (siehe agent_team_spec.v1.yaml)

## Dateien (Single Source of Truth)
- team_plan.md — Owners, Workstreams, Status, Blockers
- team_findings.md — Discoveries, Root Causes, Gotchas
- team_progress.md — Timestamped Execution Log
- team_decisions.md — Decision Records
- autonomy_policy.md — Autonomy Ladder + Hard Rules
- policy_approval_rules.yaml — Approval Triggers
- scorecard_definition.md — Scoring Rubric + Gates
- golden_tasks.yaml — Baseline Tasks
- trace_schema.json — Minimal Telemetry Contract

## Rules of Engagement
1. Lese `team_plan.md` vor dem Handeln.
2. Schreibe Findings sofort in `team_findings.md`.
3. Logge Progress mit Timestamps in `team_progress.md`.
4. Führe niemals destruktive Aktionen ohne Bestätigung + Approvals aus, wenn Rules matchen.

