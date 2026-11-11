<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const route = useRoute()
// Saison passée choisie dans `?saison=`, sinon la saison en cours
const season = computed(() => (typeof route.query.saison === 'string' ? route.query.saison : undefined))

const [{ data: standings, error }, { data: schedule }] = await Promise.all([
  useFetch('/api/standings', { query: { season } }),
  useFetch('/api/schedule', { pick: ['season'] }),
])

if (error.value || !standings.value) {
  const invalidSeason = error.value?.statusCode === 400
  throw createError({
    statusCode: invalidSeason ? 404 : 502,
    message: invalidSeason ? 'Saison introuvable' : 'Impossible de charger les classements',
    fatal: true,
  })
}

const drivers = computed(() => standings.value!.drivers)
const constructors = computed(() => standings.value!.constructors)

const currentSeason = computed(() => Number(schedule.value?.season ?? drivers.value.season))
const pastSeasons = computed(() =>
  Array.from({ length: currentSeason.value - 1950 }, (_, i) => String(currentSeason.value - 1 - i)),
)

const tabs: TabsItem[] = [
  { label: 'Pilotes', value: 'drivers', slot: 'drivers' },
  { label: 'Constructeurs', value: 'constructors', slot: 'constructors' },
]

useSeoMeta({
  title: () => (season.value ? `Classements ${season.value}` : 'Classements'),
})
</script>

<template>
  <UContainer class="py-10">
    <PageHeader :eyebrow="`Saison ${drivers.season}`" title="Classements">
      <template #right>
        <div class="flex flex-wrap items-center justify-end gap-x-6 gap-y-3">
          <span>{{ season ? '' : 'Après ' }}{{ drivers.round }} manche{{ drivers.round > 1 ? 's' : '' }}</span>
          <SeasonSelect :seasons="pastSeasons" :default-label="`Saison ${currentSeason}`" />
        </div>
      </template>
    </PageHeader>

    <UTabs :items="tabs" variant="link" color="neutral" default-value="drivers" :unmount-on-hide="false">
      <template #drivers>
        <DriverStandingsTable :items="drivers.items" class="mt-6" />
      </template>
      <template #constructors>
        <ConstructorStandingsTable v-if="constructors.items.length" :items="constructors.items" class="mt-6" />
        <p v-else class="mt-6 text-sm text-muted">
          Pas de championnat constructeurs avant 1958.
        </p>
      </template>
    </UTabs>
  </UContainer>
</template>
