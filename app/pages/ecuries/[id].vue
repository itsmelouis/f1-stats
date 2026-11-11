<script setup lang="ts">
import type { ConstructorSeason } from '#shared/types/f1'

const route = useRoute()
const id = computed(() => String(route.params.id))
const season = computed(() => (typeof route.query.saison === 'string' ? route.query.saison : null))

const { data: career, error } = await useFetch(() => `/api/constructors/${id.value}`)

if (error.value || !career.value) {
  const notFound = !error.value || [400, 404].includes(error.value.statusCode ?? 0)
  throw createError({
    statusCode: notFound ? 404 : 502,
    message: notFound ? 'Écurie introuvable' : 'Impossible de charger cette écurie',
    fatal: true,
  })
}

const { data: detail, status: detailStatus } = await useAsyncData(
  () => `constructor-season-${id.value}-${season.value}`,
  () => (season.value ? $fetch<ConstructorSeason>(`/api/constructors/${id.value}/${season.value}`) : Promise.resolve(null)),
)

// Pas de variable `constructor` : dans un template, Vue la résout en `Object`
const team = computed(() => career.value!.constructor)
const titles = computed(() => new Set(career.value!.titles))

const careerStats = computed(() => {
  const { stats } = career.value!
  return [
    { label: 'Titres', value: titles.value.size },
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

useSeoMeta({
  title: () => (season.value ? `${team.value.name} · ${season.value}` : team.value.name),
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

    <PageHeader :eyebrow="`Écurie · ${nationalityCountry(team.nationality)}`" :title="team.name">
      <template #title>
        <span class="flex items-center gap-4">
          <span class="h-8 w-1 shrink-0" :style="{ backgroundColor: teamColor(team.id) }" aria-hidden="true" />
          {{ team.name }}
        </span>
      </template>
      <template v-if="team.url" #description>
        <a
          :href="team.url"
          target="_blank"
          rel="noopener noreferrer"
          class="underline decoration-(--ui-border-accented) underline-offset-4 hover:text-highlighted hover:decoration-current"
        >Wikipédia</a>
      </template>
      <template #right>
        <SeasonSelect :seasons="career!.seasons" />
      </template>
    </PageHeader>

    <!-- Toute l'histoire -->
    <template v-if="!season">
      <StatList :items="careerStats" />
      <p class="mt-4 text-sm text-muted">
        <template v-if="titles.size">
          Champion du monde des constructeurs en {{ career!.titles.join(', ') }}.
        </template>
        Podiums comptés par voiture.
      </p>

      <h2 class="mt-12 mb-3 text-sm font-medium text-muted">
        Saisons
      </h2>
      <ul class="flex flex-wrap gap-x-4 gap-y-2 font-mono text-sm tabular-nums">
        <li v-for="item in career!.seasons" :key="item">
          <NuxtLink
            :to="{ query: { saison: item } }"
            class="hover:underline hover:underline-offset-4"
            :class="titles.has(item) ? 'font-semibold text-primary' : 'text-muted hover:text-highlighted'"
            :title="titles.has(item) ? `Champion du monde ${item}` : undefined"
          >
            {{ item }}
          </NuxtLink>
        </li>
      </ul>
      <p v-if="titles.size" class="mt-3 text-xs text-muted">
        En rouge, les saisons titrées.
      </p>
    </template>

    <!-- Une saison -->
    <template v-else-if="detail">
      <StatList :items="seasonStats" />
      <p v-if="detail.champion" class="mt-4 text-sm text-muted">
        Champion du monde des constructeurs {{ detail.season }}.
      </p>
      <p v-else-if="detail.standing?.final === false" class="mt-4 text-sm text-muted">
        Saison en cours : classement provisoire.
      </p>

      <div class="mt-12 grid gap-x-16 gap-y-10 lg:grid-cols-[1fr_22rem]">
        <div class="min-w-0">
          <h2 class="mb-3 text-sm font-medium text-muted">
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
                  <th>Arrivées</th>
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
                  <td>
                    <span class="flex flex-wrap gap-x-4 gap-y-1">
                      <span v-for="(entry, index) in round.entries" :key="index" class="inline-flex items-baseline gap-1.5 whitespace-nowrap">
                        <span class="font-mono text-xs text-muted">{{ entry.driver.code }}</span>
                        <PositionCell v-if="entry.position" :position="entry.position" />
                        <span v-else class="text-xs text-dimmed">{{ statusLabel(entry.status) }}</span>
                      </span>
                    </span>
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
        </div>

        <aside>
          <h2 class="mb-3 text-sm font-medium text-muted">
            Pilotes
          </h2>
          <ol class="divide-y divide-default border-y border-default text-sm">
            <li v-for="item in detail.drivers" :key="item.driver.id" class="flex items-center gap-3 py-2.5">
              <DriverName :driver="item.driver" :constructor="team" class="min-w-0 flex-1" />
              <span class="shrink-0 text-right font-mono tabular-nums">
                <span class="text-highlighted">{{ formatPoints(item.points) }}</span>
                <span class="block text-xs text-muted">{{ item.races }} GP</span>
              </span>
            </li>
          </ol>
        </aside>
      </div>
    </template>

    <p v-else-if="detailStatus !== 'pending'" class="text-sm text-muted">
      {{ team.name }} n'a disputé aucun Grand Prix en {{ season }}.
    </p>
  </UContainer>
</template>
