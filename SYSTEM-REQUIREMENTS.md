# System Requirements

> This is a **Node.js monorepo** (NestJS + Next.js), not a Python project.
> Dependencies are declared in `package.json` / `backend/package.json` / `frontend/package.json`.
> This file lists the **system-level software** you need installed before running `pnpm install`.

---

## Required

| Tool        | Minimum  | Recommended | Verify command         |
| ----------- | -------- | ----------- | ---------------------- |
| Node.js     | 20.0.0   | 20.x LTS    | `node -v`              |
| pnpm        | 9.0.0    | 9.12+       | `pnpm -v`              |
| Docker      | 24.x     | latest      | `docker --version`     |
| Docker Compose | v2.x  | latest      | `docker compose version` |
| Git         | 2.40+    | latest      | `git --version`        |

## Provided by Docker (no host install needed)

| Service        | Version | Container image      |
| -------------- | ------- | -------------------- |
| PostgreSQL     | 16      | `postgres:16-alpine` |
| Redis          | 7       | `redis:7-alpine`     |
| Nginx          | 1.27    | `nginx:1.27-alpine`  |

You only need host installs of Postgres/Redis if you choose **not** to use the included `docker-compose.yml`.

## Optional (production / advanced)

| Tool             | Purpose                                          |
| ---------------- | ------------------------------------------------ |
| AWS CLI          | If you enable the Textract OCR provider          |
| gcloud CLI       | If you enable the Google Vision OCR provider     |
| Azure CLI        | If you enable the Azure Document Intelligence provider |
| Mistral API key  | Default OCR provider (cheapest, recommended)     |
| kubectl + Helm   | Only for Kubernetes deployments                  |

## Installing pnpm (most common gap)

```bash
# Via Corepack (ships with Node 20+)
corepack enable
corepack prepare pnpm@9.12.0 --activate

# OR via npm
npm install -g pnpm@9
```

## Quick verification

```bash
node -v          # should print v20.x.x or higher
pnpm -v          # should print 9.x.x or higher
docker --version
docker compose version
git --version
```

If all five commands succeed, you can run the boot sequence in [`README.md`](README.md#one-command-boot).

## Hardware

| Resource | Dev minimum | Dev recommended | Prod (small tenant) |
| -------- | ----------- | --------------- | ------------------- |
| RAM      | 8 GB        | 16 GB           | 4 GB / service      |
| CPU      | 4 cores     | 8 cores         | 2 vCPU / service    |
| Disk     | 10 GB free  | 20 GB free      | 50 GB + S3/object storage |

The OCR pipeline and BullMQ workers are the heaviest consumers. On 8 GB RAM, run only Postgres + Redis + backend; run the frontend on the host with `pnpm --filter @dataclean/frontend dev`.
