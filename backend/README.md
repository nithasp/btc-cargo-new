# BTC Cargo Backend API

Express + TypeScript + PostgreSQL. It serves the API the Angular frontend in
[`../frontend`](../frontend) was written against: accounts, parcels, transport bills, yuan
exchange, affiliate agents and file uploads.

## Setup

### 1. Install packages

```bash
npm install
```

### 2. Database

```bash
docker compose up -d
```

Starts PostgreSQL 17 on `127.0.0.1:5433` and Adminer on `127.0.0.1:8082`, and creates
`btc_cargo_dev` and `btc_cargo_test`. Both ports are published to this machine only.

### 3. Environment

Copy `.env.example` to `.env`. The server **refuses to start** when a required value is missing.

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `TOKEN_SECRET` | **yes** | 32+ characters. Signs the access tokens |
| `PASSWORD_PEPPER` | **yes** | 32+ characters. Mixed into every password hash |
| `DATABASE_URL` or `POSTGRES_*` | **yes** | A connection string, or host / port / db / user / password |
| `DATABASE_SSL` | – | `off` (local), `verify`, or `no-verify` for a self-signed certificate |
| `ALLOWED_ORIGIN` | – | Comma-separated frontend origins. Default `http://localhost:4200` |
| `PUBLIC_URL` | – | Public address of this API, used in report links. Default `http://localhost:PORT` |
| `ACCESS_TOKEN_EXPIRY` | – | Default `1h` |
| `REFRESH_TOKEN_EXPIRY_DAYS` | – | Default 7 |
| `REFRESH_COOKIE_SAMESITE` | – | Defaults to `none` under `ENV=production`, `strict` otherwise |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | – | Cloudflare R2. Set all four, or none |
| `UPLOAD_DIR`, `UPLOAD_MAX_BYTES` | – | Local upload folder and size limit (5 MB) |
| `GOOGLE_CLIENT_ID`, `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `LINE_CHANNEL_ID` | – | Social sign-in. Empty = that provider is off |
| `DEMO_AUTO_APPROVE_SECONDS` | – | Default 60. See [Demo behaviour](#demo-behaviour) |
| `DEMO_LOGIN_ENABLED` | – | Default `true`. `false` switches off `POST /api/auth/demo/` |
| `DEMO_USERNAME`, `DEMO_PASSWORD`, `DEMO_EMAIL` | – | The account `npm run seed` creates |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### 4. Migrate and seed

```bash
npm run migrate:up
npm run seed
```

`npm run seed` loads the reference data, the page content, a product catalog and a demo account
(`demo` / `demo1234`) with parcels, bills, wallets and an affiliate team. Running it again only refreshes the
reference data and page content; the catalog and the demo account are created once.
`npm run seed:reset` empties every table first.

### 5. Run

```bash
npm run watch              # development, restarts on save
npm run build && npm start
```

### 6. Checks

```bash
npm test                   # resets the test database, then runs the suite
npm run lint
npm run typecheck
```

## Code layout

```
src/
  routes/        URL + middleware chain, mounted under /api
  controllers/   Parse the request with a schema, call a service, send the response
  services/      Business rules: sessions, billing, exchange, verification, uploads
  repositories/  One class per table group: parameterised SQL and row mapping
  schemas/       zod schemas for every body, query and parameter
  middleware/    JWT check, rate limits, upload parsing, error handler
  seeds/         Reference data and the demo data set
  tests/         API and unit specs (Jasmine + Supertest)
migrations/      SQL migrations (db-migrate)
```

## Sessions

`POST /api/login/`, `/api/registration/`, `/api/auth/demo/` and `/api/auth/{google,facebook,line}`
answer `{ "key": "<access JWT>" }` and set the refresh token as an **HttpOnly cookie**
(`Path=/api/auth`). The frontend sends the key as `Authorization: Token <key>`.

| Route | Does |
| ----- | ---- |
| `POST /api/auth/demo/` | Signs a visitor in as the seeded demo account, no password. `404` when `DEMO_LOGIN_ENABLED=false` |
| `POST /api/auth/refresh/` | Rotates the refresh cookie and returns a new key |
| `POST /api/auth/logout/` | Ends this session |
| `POST /api/auth/logout-all/` | Ends every session of the account |

A refresh token works once. Presenting a used one again revokes the whole session. The demo and
cookie routes only accept calls from an origin in `ALLOWED_ORIGIN`.

## Uploads and Cloudflare R2

`POST /api/upload/` (multipart: `file`, `type`) stores the file and answers
`{ data: { id, filename, url } }`, where `url` is `/media/<key>`.

- With the four `R2_*` variables set, files go to that R2 bucket. Without them they are written
  to `UPLOAD_DIR`.
- The file type is read from the file's own bytes. JPEG, PNG, WebP, GIF, HEIC and PDF are accepted.
- `GET /media/<key>` streams a file to its owner (or a staff account) only, so the bucket stays
  private.
- `GET /api/upload/`, `PUT /api/upload/:id/` and `DELETE /api/upload/:id/` list, replace and
  delete the caller's files. Replacing or deleting removes the old object from storage.

## Social sign-in

Each provider's token is checked with the provider and must have been issued to this
application.

| Provider | `.env` | Frontend `environment.ts` |
| -------- | ------ | ------------------------- |
| Google | `GOOGLE_CLIENT_ID` | `googleClientId` |
| Facebook | `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` | `facebookAppId` |
| LINE | `LINE_CHANNEL_ID` | `lineLoginLiffId`, `lineConnectLiffId` |

A provider with no keys answers `503`. LINE Notify was shut down by LINE on 31 March 2025, so
`/api/line_notify/link/` answers `410`.

## Demo behaviour

The original system had staff approving requests in a back office. This project has none, so:

- an identity verification left in review is approved after `DEMO_AUTO_APPROVE_SECONDS`;
- a reported payment is confirmed after the same delay.

Set `DEMO_AUTO_APPROVE_SECONDS=0` to keep both waiting.

## Deploying

The [`Dockerfile`](Dockerfile) builds a runtime image with no dev dependencies, running as the
unprivileged `node` user. Run `npm run migrate:prod` before the new version starts;
[`railway.json`](railway.json) does that on Railway. `GET /healthz` answers 503 when the
database is unreachable.

To load the mock data on a deployed instance, run `npm run seed:prod` there once (it uses the
compiled build, so it works in the runtime image).

A deployment needs at least `ENV=production`, `DATABASE_URL`, `TOKEN_SECRET`, `PASSWORD_PEPPER`,
`ALLOWED_ORIGIN` and `PUBLIC_URL`, and the `R2_*` variables so uploads survive a redeploy.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run watch` | Dev server, recompiles and restarts on save |
| `npm run build` / `npm start` | Compile to `dist/` and run it |
| `npm test` | Reset the test database, then run the suite |
| `npm run lint` / `npm run format` | ESLint / Prettier |
| `npm run migrate:up` / `migrate:down` / `migrate:reset` | Migrations on the dev database |
| `npm run migrate:prod` | Migrations on the production database |
| `npm run seed` / `npm run seed:reset` | Load the mock data / wipe and reload it |
| `npm run seed:prod` | The same seed from the compiled build, for a deployed instance |
