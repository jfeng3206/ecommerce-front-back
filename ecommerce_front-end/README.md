# Ecommerce Front-End Scaffold

A minimal React + Vite workspace that mirrors the ecommerce backend described in `../API.md`. Authentication, catalog, and order history now call the live `/api/auth/*`, `/api/products`, and `/api/orders` endpoints; cart and payments still use placeholder content until their APIs are wired.

## Prerequisites
- Node 20.19+ (Vite 7 and React Router 7 require it).
- npm 10+ (ships with Node 20). Upgrade locally before installing dependencies.

## Getting Started
```bash
npm install                # installs dependencies (run after upgrading Node)
npm run dev                # start the Vite dev server on http://localhost:5173
npm run build              # type-check + production build
npm run preview            # serve the build locally
npm run lint               # eslint + typescript-eslint rules
```
Use `npm run dev -- --host` when testing on devices that share your network.

## Docker & One-click setup
The project ships with a production Dockerfile (`Dockerfile`) and a compose file (`../docker-compose.yml`) so you can boot both the Spring Boot backend and this frontend with one command.

### Build/run just the frontend image
```bash
docker build -t ecommerce-frontend .
docker run --rm -p 4173:80 -e VITE_API_BASE_URL=http://localhost:8080/api ecommerce-frontend
```
Override `VITE_API_BASE_URL` if your backend lives elsewhere.

### Run frontend + backend together
1. Build or provide a backend image tagged `ecommerce-backend:latest` (or edit `docker-compose.yml` to point to your backend build context).
2. From the repo root, run:
   ```bash
   docker compose up --build
   ```
   This starts two containers:
   - `backend` on `:8080` (accessible as `http://backend:8080` inside the network).
   - `frontend` on `:4173` serving the production build via nginx.

`VITE_API_BASE_URL` defaults to `http://localhost:8080/api` for local dev. When running under Compose, the frontend service automatically uses `http://backend:8080/api` via an environment variable defined in `docker-compose.yml`.

## Auth & Roles
After signing in, the UI automatically calls `GET /api/users/me` with the issued JWT. The response must include the user's role (`USER`, `ADMIN`, `PAYMENT_ADMIN`, or `SERVICE_ORDER`) so role-aware views (catalog admin metadata, order dashboards) can render correctly. Orders rely on:
- `GET /api/orders/mine` – returns the signed-in user's history.
- `GET /api/orders` – admin-only, paginated list for escalations.
Ensure both endpoints enforce `Authorization: Bearer <token>`.

## Project Structure
```
src/
  api/              # data-fetching helpers (auth, products, future modules)
  components/       # shared UI blocks
  features/
    auth/           # login/register screens wired to /api/auth/*
    catalog/        # paginated grid backed by /api/products
    cart/           # cart summary placeholder
    orders/         # customer order history placeholder
    payments/       # payment admin actions placeholder
  lib/              # utilities (token storage, soon formatters)
  routes/           # React Router config
  styles/           # tailwind tokens or global partials
```
Tailwind is configured through `tailwind.config.js` and the directives live in `src/index.css`.

## Next Steps
- Wire cart, orders, and payments views to their respective `/api/*` services.
- Add auth context-based route guards and user role fetching to gate admin screens.
- Extend the styling system (theme tokens, loading states, error toasts) as features grow.
- Once stable, revisit automated testing (Jest, RTL, MSW) if higher confidence is needed.
