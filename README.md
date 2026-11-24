# Cardrona Resort Management — local edition

Runs independently of Base44. No Base44 account, CLI, environment variables, SDK, or hosted backend is required.

## Run locally

Use Node.js 22.12 or newer:

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Open the localhost URL printed by Vite. The customer storefront is at `/`; the management dashboard is at `/dashboard`.

The dashboard opens as a local demo administrator. There is no server authentication or access control. Customer demo accounts are part of the existing storefront simulation.

## Data and files

Dashboard records and uploaded files are saved in this browser's localStorage under `cardrona_local_v1:` keys. The existing storefront keeps its separate local demo state. Changes persist across reloads on the same origin, but do not sync between browsers or between storefront and dashboard. Dashboard collections start empty; create records through the management screens. Existing Base44 data is not downloaded or migrated.

Clearing site data removes local records. Browser storage limits apply, particularly to uploaded photos. Use demo data only: localStorage is not secure storage for guest documents or payment details.

Real Stripe payments/refunds, social sign-in, email, OTP and MFA require independent backend services and are unavailable in this local edition. The storefront's checkout remains a simulation and does not charge a card. External images and fonts may still require internet access; the app logic and local records do not require Base44.

## Build and check

```bash
npm run build
npm run preview -- --host 127.0.0.1
npm run lint
npm run typecheck
node --test tests/localClient.test.mjs
```

`dist/` contains the standalone frontend build. A static host must serve `index.html` for application routes.

## GitHub Pages

In GitHub Settings → Pages, select GitHub Actions as the source. The workflow in `.github/workflows/deploy.yml` builds and publishes `dist/` on pushes to `main`, or when run manually in Actions. It sets `GITHUB_PAGES=true` to build with the `/Cardrona-product--Content-Management-System/` asset path and hash routing so refreshing an application page works on GitHub Pages. Local development continues to use normal routes.

To check this build locally, run `GITHUB_PAGES=true npm run build`, then `npm run preview` and open `http://localhost:4173/Cardrona-product--Content-Management-System/`.

The `base44/` folder preserves the old entity definitions and function source as migration references; it is not used by the local app.
