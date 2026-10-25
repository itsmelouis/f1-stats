# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Node 22 via nvm (`.nvmrc`), pnpm via corepack (version pinned in `package.json`).

```bash
nvm use && corepack enable && pnpm install
pnpm dev          # http://localhost:3000
pnpm lint         # ESLint (antfu config + Nuxt rules + better-tailwindcss) — `pnpm lint:fix` to autofix
pnpm typecheck    # nuxt typecheck (vue-tsc)
pnpm build        # builds for Cloudflare Workers (preset cloudflare_module)
pnpm cf:preview   # build + wrangler dev
pnpm deploy       # build + wrangler deploy → https://f1.itslouis.dev
```

There is no test suite; CI (`.github/workflows/ci.yml`) runs `pnpm install --frozen-lockfile`, lint and typecheck on pushes to `main` and PRs. Verify UI changes in a browser against the dev server.

## Conventions

- **Conventional Commits** in **English** (`feat:`, `fix:`, `docs:`, `chore:`…, optional scope).
- `main` is protected by a ruleset: no force-push, no deletion.
- The UI is in **French**; all dates/times are formatted in `Europe/Paris` via `app/utils/format.ts` (server and client must agree to avoid hydration mismatches — the reference "now" is shared through `useState('now')`).
- Design is deliberately sober/editorial: hairline-divided lists and tables, mono tabular numbers, no cards, badges, gradients or flags. Theme tokens (`f1red`, `f1gray`, dark-mode `--ui-*` overrides) and the `f1-table` / `f1-num` utilities live in `app/assets/css/main.css`. `f1-table` selectors use `:where()` so `f1-num` can override alignment on headers.
- pnpm 12 enforces `trustPolicy: no-downgrade`; `pnpm-workspace.yaml` relaxes it with `trustPolicyIgnoreAfter` and an explicit `trustPolicyExclude` list (cssnano family). If an install fails with `ERR_PNPM_TRUST_DOWNGRADE`, extend that config rather than disabling the policy. ESLint also lints this YAML (key order, enforced settings).

## Architecture

Nuxt 4 app (`app/`), Nitro server (`server/`), and types shared between both in `shared/types/f1.ts`.

**Data flow.** Pages call `useFetch('/api/...')`. API routes in `server/api/` are thin `defineEventHandler`s that delegate to cached functions in `server/utils/`:

- `jolpica.ts` — client for [Jolpica F1](https://api.jolpi.ca) (free, keyless Ergast successor). Defines raw API types, normalizes them into the shared types, and exposes `getSchedule`, `getStandings` (drivers + constructors + podiums in one call), `getRaceDetail(round)` (results, qualifying, sprint, previous/next round, circuit map).
- `openf1.ts` — [OpenF1](https://openf1.org) fallback used by `getRaceDetail` for finished sessions Jolpica has not published yet (Jolpica often lags a day). Free tier: historical data only, i.e. 30 min after a session ends, 30 req/min. Drivers are mapped to Jolpica ids by their 3-letter code.
- `circuits.ts` — circuit layouts from the `bacinger/f1-circuits` GeoJSON dataset, matched to Jolpica circuits by GPS distance and projected server-side into an SVG path (`CircuitMap` type), rendered by `app/components/CircuitMap.vue`.

**Caching.** Caching is done with Nitro `defineCachedFunction` on these data functions (not `defineCachedEventHandler` on routes) so results are shared across routes and errors are never cached. Storage mount `cache`: Cloudflare KV binding `CACHE` in production, `fs` under `.nuxt/cache` in dev (configured in `nuxt.config.ts`). Cached functions take the H3 `event` as their first argument (and their `getKey` skips it): Nitro only calls `event.waitUntil` on the SWR refresh when `args[0]` is an event, and without it the Worker kills the refresh after the response, so stale entries are served forever. Changing the shape of a cached function's return value can serve stale data in dev — `rm -rf .nuxt/cache`.

**Rate limits.** Jolpica allows ~4 req/s burst and 500 req/h per IP, and Cloudflare Workers share egress IPs. All Jolpica calls go through `jolpica()` which caps concurrency at 2 and retries 429/5xx with backoff. Keep the number of parallel upstream calls per request low (that is why drivers and constructors standings are a single route).

**Deployment.** Cloudflare Worker `f1-stats` with static assets, custom domain `f1.itslouis.dev`. `wrangler.jsonc` holds the user-owned config (name, route, KV, flags); Nitro (`cloudflare.deployConfig`) merges it with `main`/`assets` into `.output/server/wrangler.json` at build time, which `wrangler deploy` picks up via `.wrangler/deploy/config.json`. Edit `wrangler.jsonc`, never the generated file. `raw.githubusercontent.com` serves JSON as `text/plain`, hence `responseType: 'json'` in `circuits.ts`.
