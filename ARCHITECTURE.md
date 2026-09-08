# Architecture - blueFrame Insight

Monorepo (pnpm workspaces): apps/frontend + apps/backend

Flow: Next.js frontend > HTTPS > NestJS API > PostgreSQL (Render)

## Backend modules

Auth, CRM, Inventory, Sentiment, Agents, Graph, Simulator,
Multimodal, Executive, Seed, Test

## Database models

User, Customer, Deal, Activity, Product, Movement, AgentLog

## Frontend pages

login, executive, crm, inventory, sales, analytics, sentiment,
agents, graph, simulator, ai-insights, multimodal

## Security

- JWT authentication
- bcrypt password hashing (10 rounds)
- CORS allowlist
- NestJS ValidationPipe

## Deployment

- Backend: blueframe-backend.onrender.com
- Frontend: blueframe-frontend.onrender.com
- DB: Render PostgreSQL (Frankfurt)

Updated: 2026-09-08
