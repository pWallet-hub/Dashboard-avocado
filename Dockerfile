# ── Stage 1: Build ────────────────────────────────────────────────────────────
# Node 20 is EOL and too old for current deps (jsdom 29, rolldown, vitest 4
# require Node ^20.19 || ^22.12+); build on the current Node 22 LTS instead.
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
# npm ci fails here: package-lock.json's optionalDependencies platform list
# (esbuild's per-OS/arch binaries) is incomplete for the Alpine/musl target,
# a known class of npm/esbuild lockfile issue. npm install resolves it.
RUN npm install

COPY . .

# Vite bakes VITE_* env vars into the bundle at build time. Default to the
# canonical production backend so the built bundle works standalone, without
# depending on an nginx-side reverse proxy to a sibling "api" container.
ARG VITE_API_BASE_URL=https://api.rwandaavocados.rw/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Disabled: Coolify runs its own healthcheck against a port configured in its
# UI, separate from this Dockerfile's HEALTHCHECK. A mismatch there caused
# "connection refused" and rollback loops even though nginx was healthy.
HEALTHCHECK NONE

CMD ["nginx", "-g", "daemon off;"]
