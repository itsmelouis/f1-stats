<script setup lang="ts">
import type { DriverSeason, RoundEntry } from '#shared/types/f1'

const route = useRoute()
const id = computed(() => String(route.params.id))
const season = computed(() => (typeof route.query.saison === 'string' ? route.query.saison : null))

const { data: career, error } = await useFetch(() => `/api/drivers/${id.value}`)

if (error.value || !career.value) {
  const notFound = !error.value || [400, 404].includes(error.value.statusCode ?? 0)
  throw createError({
    statusCode: notFound ? 404 : 502,
    message: notFound ? 'Pilote introuvable' : 'Impossible de charger ce pilote',
    fatal: true,
  })
}

const { data: detail, status: detailStatus } = await useAsyncData(
  () => `driver-season-${id.value}-${season.value}`,
  () => (season.value ? $fetch<DriverSeason>(`/api/drivers/${id.value}/${season.value}`) : Promise.resolve(null)),
)

const driver = computed(() => career.value!.driver)
const fullName = computed(() => `${driver.value.firstName} ${driver.value.lastName}`)

const eyebrow = computed(() => {
  const parts = ['Pilote', nationalityCountry(driver.value.nationality)]
  if (driver.value.number)
    parts.push(`n° ${driver.value.number}`)
  return parts.join(' · ')
})

const careerStats = computed(() => {
  const { stats, titles } = career.value!
  return [
    { label: 'Titres', value: titles.length },
    { label: 'Grands Prix', value: stats.races },
    { label: 'Victoires', value: stats.wins },
    { label: 'Podiums', value: stats.podiums },
    { label: 'Poles', value: stats.poles },
    { label: 'Meilleurs tours', value: stats.fastestLaps },
  ]
})

const seasonStats = computed(() => {
  if (!detail.value)
    return []
  const { stats, standing } = detail.value
  return [
    { label: 'Classement', value: standing ? formatRank(standing.position) : '—' },
    { label: 'Points', value: standing ? formatPoints(standing.points) : '—' },
    { label: 'Victoires', value: stats.wins },
    { label: 'Podiums', value: stats.podiums },
    { label: 'Poles', value: stats.poles },
    { label: 'Grands Prix', value: stats.races },
  ]
})

function entryOf(entries: RoundEntry[]) {
  return entries.find(e => e.driver.id === id.value) ?? entries[0]!
}

useSeoMeta({
  title: () => (season.value ? `${fullName.value} · ${season.value}` : fullName.value),
})
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-6 text-sm">
      <NuxtLink to="/classements" class="inline-flex items-center gap-1.5 text-muted hover:text-highlighted">
        <UIcon name="i-lucide-arrow-left" class="size-4" />
        Classements
      </NuxtLink>
    </div>

    <PageHeader :eyebrow="eyebrow" :title="fullName">
      <!-- Photo détourée posée sur le filet de l'en-tête -->
      <template v-if="driver.photo" #media>
        <img :src="driver.photo" :alt="fullName" width="112" height="112" class="size-20 shrink-0 object-contain object-bottom sm:-mb-6 sm:size-28">
      </template>
      <template #title>
        <span class="font-normal text-muted">{{ driver.firstName }}</span> <span class="uppercase">{{ driver.lastName }}</span>
      </template>
      <template #description>
        <template v-if="driver.dateOfBirth">
          Né le {{ formatDate(driver.dateOfBirth, { day: 'numeric', month: 'long', year: 'numeric' }) }} ·
        </template>
        <a
          v-if="driver.url"
          :href="driver.url"
          target="_blank"
          rel="noopener noreferrer"
          class="underline decoration-(--ui-border-accented) underline-offset-4 hover:text-highlighted hover:decoration-current"
        >Wikipédia</a>
      </template>
      <template #right>
        <SeasonSelect :seasons="career!.seasons.map(s => s.season)" />
      </template>
    </PageHeader>

    <!-- Toute la carrière -->
    <template v-if="!season">
      <StatList :items="careerStats" />
      <p v-if="career!.titles.length" class="mt-4 text-sm text-muted">
        Champion du monde en {{ career!.titles.join(', ') }} (en rouge dans le tableau).
      </p>

      <h2 class="mt-12 mb-3 text-sm font-medium text-muted">
        Saison par saison
      </h2>
      <div class="overflow-x-auto">
        <table class="f1-table">
          <thead>
            <tr>
              <th>Saison</th>
              <th>Écurie</th>
              <th class="f1-num">
                Championnat
              </th>
              <th class="f1-num hidden sm:table-cell">
                GP
              </th>
              <th class="f1-num">
                Victoires
              </th>
              <th class="f1-num hidden sm:table-cell">
                Podiums
              </th>
              <th class="f1-num hidden sm:table-cell">
                Poles
              </th>
              <th class="f1-num hidden sm:table-cell">
                Meilleure arrivée
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in career!.seasons" :key="item.season">
              <td class="whitespace-nowrap">
                <NuxtLink :to="{ query: { saison: item.season } }" class="font-mono font-medium text-highlighted tabular-nums hover:underline hover:underline-offset-4">
                  {{ item.season }}
                </NuxtLink>
              </td>
              <td>
                <span class="flex flex-col gap-1">
                  <TeamName v-for="team in item.constructors" :key="team.id" :constructor="team" />
                </span>
              </td>
              <td
                class="f1-num"
                :class="item.champion ? 'font-semibold text-primary' : 'text-highlighted'"
                :title="item.champion ? `Champion du monde ${item.season}` : undefined"
              >
                {{ item.standing ? formatRank(item.standing) : '—' }}
              </td>
              <td class="f1-num hidden text-muted sm:table-cell">
                {{ item.races }}
              </td>
              <td class="f1-num" :class="item.wins ? 'text-highlighted' : 'text-dimmed'">
                {{ item.wins }}
              </td>
              <td class="f1-num hidden sm:table-cell" :class="item.podiums ? 'text-muted' : 'text-dimmed'">
                {{ item.podiums }}
              </td>
              <td class="f1-num hidden sm:table-cell" :class="item.poles ? 'text-muted' : 'text-dimmed'">
                {{ item.poles }}
              </td>
              <td class="f1-num hidden text-muted sm:table-cell">
                {{ item.bestFinish ? formatRank(item.bestFinish) : '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Une saison -->
    <template v-else-if="detail">
      <StatList :items="seasonStats" />
      <p v-if="detail.champion" class="mt-4 text-sm text-muted">
        Champion du monde {{ detail.season }}.
      </p>
      <p v-else-if="detail.standing?.final === false" class="mt-4 text-sm text-muted">
        Saison en cours : classement provisoire.
      </p>

      <h2 class="mt-12 mb-3 text-sm font-medium text-muted">
        Grands Prix {{ detail.season }}
      </h2>
      <div class="overflow-x-auto">
        <table class="f1-table">
          <thead>
            <tr>
              <th class="w-10">
                Manche
              </th>
              <th>Grand Prix</th>
              <th class="hidden md:table-cell">
                Écurie
              </th>
              <th class="f1-num hidden sm:table-cell">
                Grille
              </th>
              <th class="f1-num">
                Arrivée
              </th>
              <th class="f1-num">
                Points
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="round in detail.rounds" :key="round.round">
              <td class="font-mono text-muted tabular-nums">
                {{ round.round }}
              </td>
              <td class="text-highlighted">
                {{ raceName(round.name) }}
              </td>
              <td class="hidden md:table-cell">
                <TeamName :constructor="entryOf(round.entries).constructor" />
              </td>
              <td class="f1-num hidden text-muted sm:table-cell">
                {{ entryOf(round.entries).grid || '–' }}
              </td>
              <td class="f1-num">
                <PositionCell v-if="entryOf(round.entries).position" :position="entryOf(round.entries).position" />
                <span v-else class="font-sans text-xs text-dimmed">{{ statusLabel(entryOf(round.entries).status) }}</span>
              </td>
              <td class="f1-num" :class="round.points ? 'font-semibold text-highlighted' : 'text-dimmed'">
                {{ formatPoints(round.points) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="detail.season >= '2021'" class="mt-3 text-xs text-muted">
        Points du week-end, sprint compris.
      </p>
    </template>

    <p v-else-if="detailStatus !== 'pending'" class="text-sm text-muted">
      Aucun Grand Prix disputé par {{ fullName }} en {{ season }}.
    </p>
  </UContainer>
</template>
