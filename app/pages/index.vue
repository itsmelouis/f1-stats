<script setup lang="ts">
// Instant de référence partagé serveur/client (évite les écarts d'hydratation)
const now = useState('now', () => new Date().toISOString())

const { data: schedule, error } = await useFetch('/api/schedule')

if (error.value) {
  throw createError({ statusCode: 502, message: 'Impossible de charger le calendrier', fatal: true })
}

const races = computed(() => schedule.value?.races ?? [])
const nextRace = computed(() => races.value.find(r => r.at >= now.value))
const completed = computed(() => races.value.filter(r => r.at < now.value).length)
const lastRace = computed(() => races.value.findLast(r => r.at < now.value))

// Podium de la dernière course ; un échec ne doit pas casser l'accueil
const { data: lastResults } = await useFetch(() => `/api/races/${lastRace.value?.round}`, {
  immediate: Boolean(lastRace.value),
  pick: ['results'],
})
const groups = computed(() => groupRacesByMonth(races.value))

useSeoMeta({
  title: 'Calendrier',
})
</script>

<template>
  <UContainer class="py-10">
    <PageHeader :eyebrow="`Saison ${schedule?.season}`" title="Calendrier">
      <template #right>
        {{ completed }} / {{ races.length }} courses disputées
      </template>
    </PageHeader>

    <NextRaceHero v-if="nextRace" :race="nextRace" />

    <LastRace v-if="lastRace" :race="lastRace" :results="lastResults?.results ?? null" />

    <div class="flex flex-col gap-10">
      <section v-for="group in groups" :key="group.month">
        <h2 class="border-b border-default pb-2 text-sm font-medium text-muted capitalize">
          {{ group.month }}
        </h2>
        <div class="divide-y divide-default">
          <RaceRow
            v-for="race in group.races"
            :key="race.round"
            :race="race"
            :status="raceStatus(race, now, nextRace?.round)"
          />
        </div>
      </section>
    </div>
  </UContainer>
</template>
