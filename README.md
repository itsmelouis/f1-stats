<div align="center">

# f1-stats

[![CI](https://img.shields.io/github/actions/workflow/status/itsmelouis/f1-stats/ci.yml?style=flat-square&logo=github&label=CI)](https://github.com/itsmelouis/f1-stats/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)
[![Made with Nuxt](https://img.shields.io/badge/Made%20with-Nuxt-00DC82?style=flat-square&logo=nuxt&labelColor=020420)](https://nuxt.com)

Formula 1 season tracker — calendar, race results and championship standings, in French.

Live at **[f1.itslouis.dev](https://f1.itslouis.dev)**.

[Features](#features) • [Stack](#stack) • [Quick Start](#quick-start) • [Scripts](#scripts) • [Deployment](#deployment)

</div>

## Features

- **Calendar** — the next race pinned with a live countdown and the weekend schedule
- **Standings** — drivers' and constructors' championships with wins, podiums and gap to the leader
- **Race details** — race, qualifying and sprint results with times, gaps and points
- **Circuit maps** — track layouts drawn as SVG, click to zoom
- **Navigation** — jump to the previous or next round with `←` / `→`
- **Light & dark themes** — follows the system, all times shown in Paris time

## Stack

- **[Nuxt 4](https://nuxt.com)** — Vue framework, server-rendered on Cloudflare Workers
- **[Nuxt UI v4](https://ui.nuxt.com)** — components & theming
- **[Jolpica F1](https://github.com/jolpica/jolpica-f1)** — free, keyless F1 data API (Ergast successor)
- **[bacinger/f1-circuits](https://github.com/bacinger/f1-circuits)** — circuit layouts in GeoJSON (MIT, OpenStreetMap)
- **TypeScript** — `<script setup lang="ts">` everywhere
- **[@antfu/eslint-config](https://github.com/antfu/eslint-config)** — linting

API calls are cached with Nitro's `defineCachedFunction` (stale-while-revalidate) to stay well under Jolpica's rate limits — in Cloudflare KV in production, on disk in development.

## Quick Start

Requires [Node.js](https://nodejs.org) 22 (see `.nvmrc`) and [pnpm](https://pnpm.io) via corepack.

Install the dependencies:

```bash
nvm use
corepack enable
pnpm install
```

Start the dev server on `http://localhost:3000`:

```bash
pnpm dev
```

## Scripts

```bash
pnpm dev          # Start the dev server
pnpm build        # Build for Cloudflare Workers
pnpm cf:preview   # Build and run the Worker locally with Wrangler
pnpm deploy       # Build and deploy to Cloudflare
pnpm lint         # Lint with ESLint
pnpm typecheck    # Type-check with vue-tsc
```

## Deployment

Deployed on **Cloudflare Workers** with static assets, on the `f1.itslouis.dev` custom domain. The Wrangler config lives in `wrangler.jsonc`; Nitro's `cloudflare_module` preset generates the final config at build time.

```bash
npx wrangler login
pnpm deploy
```

## License

MIT © [Louis F.](https://github.com/itsmelouis)

F1, Formula One and related marks are trademarks of Formula One Licensing BV. This project is unofficial and not associated with the Formula 1 companies.
