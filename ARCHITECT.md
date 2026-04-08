# ARCHITECT.md: SaaS Ecosystem Master Blueprint

## System Overview
This is a unified, agent-orchestrated SaaS Ecosystem containing 11+ platforms, a 10-agent fleet, and comprehensive clinical/enterprise infrastructure. It is designed for high-fidelity code generation, production-grade deployment, and AI-native autonomy.

## Directory Structure
- `/apps`: The core business units (Axon, Healthcare OS, Sentrix, Cliniq OS, Vaultly, Revivo, Novu).
- `/packages`: Shared engines and skills (Antigravity Core, Agency Agents, Cursor Skills).
- `/infra`: Global platform infrastructure (N8N Workflows, Docker, Kafka, Proxy).
- `/docs`: Centralized specifications, task lists, and project knowledge items (KIs).
- `/scripts`: Automation and orchestration scripts.

## Platform Context
1. **Novu**: The flagship patient reactivation platform. (HIGHEST PRIORITY)
2. **Sovereign Growth Engine**: B2B expansion engine for Novu clinical partnerships.
3. **Axon**: [LEGACY / DEAD] Contact memory platform. De-prioritized.

## Intelligence Fleet
The ecosystem is designed to be managed by a fleet of specialized agents:
- **Sentinel**: Security and governance (Sentrix).
- **Pulse**: Revenue monitoring and trend analysis.
- **Scribe**: Clinical NLP and SOAP note extraction.
- **Scout/Caller**: Lead qualification and outreach.

## Technical Stack
- **Languages**: TypeScript (Next.js 16/Fastify), Go (Policy Engine), Python (AI/ML).
- **Database**: Supabase (PostgreSQL + RLS), ClickHouse (Logging), Redis (State).
- **Messaging**: Confluent Kafka.
- **Orchestration**: Turborepo + PNPM.
- **Automation**: N8N.

## Handover Instructions for New Antigravity
When you pick up this project, your first task is to:
1. Run `pnpm setup` to initialize workspaces.
2. Run `bash scripts/launch_all.sh` to start the development environment.
3. Review `/docs/project-specs` to understand the roadmap for each platform.
