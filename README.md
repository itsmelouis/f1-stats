# F1 Stats

Calendrier, résultats et classements de la saison de Formule 1 en cours.
Nuxt 4 · Nuxt UI 4 · Tailwind CSS 4 · données [Jolpica F1](https://api.jolpi.ca) (successeur d'Ergast, gratuit et sans clé) · tracés des circuits [bacinger/f1-circuits](https://github.com/bacinger/f1-circuits) (GeoJSON, MIT, relevés OpenStreetMap).

## Pages

- `/` — calendrier de la saison, prochaine course épinglée avec le compte à rebours et les horaires de chaque séance
- `/classements` — championnats pilotes et constructeurs
- `/courses/:round` — détail d'une manche : course, qualifications et sprint (temps, écarts, points), tracé du circuit (clic pour agrandir), navigation manche précédente / suivante (flèches ← →)

Toutes les heures sont affichées en heure de Paris. Thème clair et sombre (suit le système, bascule dans l'en-tête).

## Prérequis

- [nvm](https://github.com/nvm-sh/nvm) — la version de Node est dans `.nvmrc` (Node 22)
- corepack, qui installe la version de pnpm épinglée dans `package.json`

```bash
nvm use
corepack enable
pnpm install
```

## Commandes

```bash
pnpm dev        # serveur de dev sur http://localhost:3000
pnpm build      # build de production
pnpm preview    # prévisualisation du build
pnpm lint       # ESLint (config antfu + règles Nuxt + Tailwind)
pnpm lint:fix
pnpm typecheck  # nuxt typecheck (vue-tsc)
```

## Architecture

```
app/
  components/   tables de résultats et de classements, carte de course, hero « prochaine course »
  pages/        index (calendrier), classements, courses/[round]
  utils/        formatage des dates (fr-FR, Europe/Paris), libellés, drapeaux, couleurs d'écurie
server/
  api/          routes Nitro consommées par le front (`/api/schedule`, `/api/standings/*`, `/api/races/:round`)
  utils/        client Jolpica (appels, normalisation, cache) et tracés des circuits (GeoJSON → chemin SVG)
shared/
  types/        types partagés entre le serveur et le front
```

Les appels à Jolpica passent par `defineCachedFunction` (cache Nitro, 10 min pour les résultats et classements, 1 h pour le calendrier, avec stale-while-revalidate) pour rester largement sous la limite de l'API (~500 requêtes/heure).

## CI

Le workflow GitHub Actions (`.github/workflows/ci.yml`) lance `pnpm lint` et `pnpm typecheck` sur chaque push sur `main` et sur chaque pull request.
