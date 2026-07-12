# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# npm ci fails here: package-lock.json's optionalDependencies platform list
# (esbuild's per-OS/arch binaries) is incomplete for the Alpine/musl target,
# a known class of npm/esbuild lockfile issue. npm install resolves it.
RUN npm install

COPY . .

# Vite bakes VITE_* env vars into the bundle at build time. Default to a
# same-origin relative path so nginx (below) can reverse-proxy it to the
# "api" compose service without baking in any specific host/port.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
