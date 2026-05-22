# DataClean

**Operational Data Automation Platform.**
From documents to structured operations.

DataClean ingests unstructured documents (PDFs, scans, invoices, receipts, purchase orders), extracts structured data via OCR and template-driven extraction, validates against business rules, and routes the results through automated ETL/workflow pipelines into downstream systems — with full observability over every job.

---

## Architecture

This is a production-oriented monorepo.

```
Saas/
├── backend/          NestJS 10 — modular monolith, Prisma, BullMQ, OpenTelemetry
├── frontend/         Next.js 15 (App Router), TS, Tailwind, shadcn/ui, TanStack Query, Zustand
├── infra/
│   └── nginx/        Reverse proxy config
└── docker-compose.yml
```

### Stack

| Layer            | Technology                                                  |
| ---------------- | ----------------------------------------------------------- |
| Frontend         | Next.js 15, React 18, TypeScript, Tailwind, shadcn/ui       |
| State            | Zustand (client) + TanStack Query (server)                  |
| Backend          | NestJS 10, TypeScript, Prisma 5                             |
| Database         | PostgreSQL 16                                               |
| Queue            | Redis 7 + BullMQ                                            |
| OCR              | Provider-abstracted (Mistral default; Textract/Vision/Azure pluggable) |
| Observability    | OpenTelemetry, Prometheus metrics, Pino logs, correlation IDs |
| Auth             | JWT + refresh rotation, RBAC, Passport                      |
| Reverse proxy    | Nginx                                                       |

### Backend module boundaries

```
auth          orgs        workspaces      documents
ocr           extraction  validation      etl
workflows     pipelines   integrations    monitoring
audit         health      observability   common
```

Each module follows clean-architecture separation:
controller → service → repository → Prisma. DTOs validated via class-validator.

### OCR provider abstraction

```ts
interface OCRProvider {
  name: string;
  extract(file: Buffer, opts?: OCROptions): Promise<OCRResult>;
}
```

Providers register through `OCRProviderFactory`. Active provider chosen by `OCR_PROVIDER` env.

---

## Local development

### Prerequisites

- Node.js 20+
- pnpm 9+ (or npm 10+)
- Docker Desktop

See [`SYSTEM-REQUIREMENTS.md`](SYSTEM-REQUIREMENTS.md) for full system-level dependencies and verification commands.

### One-command boot

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker compose up -d postgres redis
pnpm install
pnpm --filter @dataclean/backend prisma:migrate
pnpm dev
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:4000
- API docs → http://localhost:4000/docs
- Metrics  → http://localhost:4000/metrics
- Health   → http://localhost:4000/health

### Full container stack

```bash
docker compose up --build
```

---

## Production deployment

The stack ships container-first. Compose targets local + staging; for production deploy each service to your platform of choice (Kubernetes, ECS, Railway, Render, DigitalOcean App Platform). All services are stateless behind Postgres + Redis.

Required production secrets — see `backend/.env.example` and `frontend/.env.example`.

---

## License

Proprietary — © DataClean.
