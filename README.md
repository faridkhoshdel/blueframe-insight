# blueFrame Insight

Smart AI-powered business management platform.

## Online access

| Service | URL |
|---|---|
| Frontend | https://blueframe-frontend.onrender.com |
| Backend API | https://blueframe-backend.onrender.com |

## Key features

- CRM: customers, deals, AI lead scoring, churn risk
- Inventory: products, stock movements, low-stock alerts
- Sentiment analysis: customer feedback AI
- AI agents: retention, nurture, cross-sell, follow-up
- Executive dashboard: 360-degree business view
- Graph: customer network visualization
- Simulator: price change, campaign, customer loss
- Multimodal: voice, image, text

## Tech stack

- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- Backend: NestJS + Prisma + PostgreSQL
- Auth: JWT + bcrypt
- Deploy: Render (free tier)

## Local development

1. git clone https://github.com/faridkhoshdel/blueframe-insight.git
2. cd blueframe-insight and pnpm install
3. Backend: cd apps/backend, set DATABASE_URL in .env, npx prisma db push, pnpm dev (port 50001)
4. Frontend: cd apps/frontend, pnpm dev (port 3000)

## Default login

- Email: admin@blueframe.com
- Password: admin123456
- Change after first login

## Docs

- USER_GUIDE.md: user manual
- ARCHITECTURE.md: system architecture

## Roadmap

- RBAC roles: warehouse, visitor, supervisor, logistics, executive
- Bulk Excel import and export
- PWA mobile app for visitors
- Accounting integration
- PDF and Excel reports
- SMS and Email notifications
- Multi-warehouse support

## Developer

Farid Khoshdel - khoshdel.farid@graphic-designer.com
GitHub: faridkhoshdel
