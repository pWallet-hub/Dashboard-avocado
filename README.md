# Avocado-dashboard

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

React + Vite dashboard for the Avocado Society of Rwanda platform (admins, field agents, farmers, shop managers).

## Running it

The frontend runs as **its own Docker stack** and talks to the backend
(`dash-api`, a separate stack) over HTTP. Both stacks join the shared
`avocado-net` Docker network.

```bash
# 1. Start the backend first (in ../dash-api)
cd ../dash-api && cp .env.example .env && docker compose up -d --build

# 2. Start the frontend
cd ../Dashboard-avocado
docker compose up -d --build        # → http://localhost:3000
```

The API URL is baked into the bundle at build time. By default the compose
build targets the local backend (`http://localhost:5000/api`). Point it
elsewhere with `WEB_API_BASE_URL`:

```bash
WEB_API_BASE_URL=https://api.rwandaavocados.rw/api docker compose up -d --build
```

> The compose file deliberately does **not** read `VITE_API_BASE_URL`: Compose
> auto-loads the tracked `.env`, whose `VITE_API_BASE_URL` points at production.

### Local development (hot reload)

```bash
npm install
VITE_PROXY_TARGET=http://localhost:5000 npm run dev   # proxies /api to the backend
npm test                                              # Vitest unit tests
```

## Demo accounts (seeded by the backend)

| Role | Email | Password |
|---|---|---|
| Admin | admin@dashboardavocado.com | admin123456 |
| Agent | agent@dashboardavocado.com | agent123456 |
| Farmer | farmer@dashboardavocado.com | farmer123456 |
| Shop manager | shop@dashboardavocado.com | shop123456 |

## Features added for testing

- **Market Prices** (all roles; admins/agents record prices) — national averages with
  30-day change, weekly trend chart, latest price per market.
- **Harvest Lots & Traceability** (farmers, agents, admins) — record each harvest as a
  lot, agent verification with dry-matter maturity check, sale & delivery tracking,
  printable QR labels.
- **Public trace page** `/trace/:lotCode` — no login; what buyers see when they scan a
  lot's QR label (origin and quality only, no personal data).
- **Farmer Surveys** (admin, agent) — import the field-survey Excel file (validated
  preview → commit), indicators dashboard, searchable records with every original
  column, export to Excel. A sample file is in `dash-api/test/fixtures/sample-farmer-survey.xlsx`.
- **Farm Map** (admin, agent) — all farms on an OpenStreetMap / satellite map with
  clustering, status colours, parcel boundaries, filters and an inline land editor.
- **My Farm & Land** (farmer) — record the land title number (UPI), GPS point
  (“Use my GPS”) and draw the parcel boundary; agents verify it.
- **Activate your account** (`/activate`) — farmers registered by an agent or imported
  from the survey set their own email + password using their phone number.
