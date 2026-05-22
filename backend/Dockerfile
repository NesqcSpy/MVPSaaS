# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable

# --- deps -------------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile || pnpm install
RUN npx prisma generate

# --- development ------------------------------------------------------------
FROM deps AS development
COPY . .
EXPOSE 4000
CMD ["pnpm", "dev"]

# --- build ------------------------------------------------------------------
FROM deps AS build
COPY . .
RUN pnpm build

# --- production -------------------------------------------------------------
FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
EXPOSE 4000
USER node
CMD ["node", "dist/main.js"]
