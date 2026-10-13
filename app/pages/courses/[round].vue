<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const route = useRoute()
const round = computed(() => Number(route.params.round))
const now = useState('now', () => new Date().toISOString())

const { data: detail, error } = await useFetch(() => `/api/races/${round.value}`)

if (error.value || !detail.value) {
  const notFound = !error.value || [400, 404].includes(error.value.statusCode ?? 0)
  throw createError({
    statusCode: notFound ? 404 : 502,
    message: notFound ? 'Manche introuvable' : 'Impossible de charger cette manche',
    fatal: true,
  })
}

const race = computed(() => detail.value!.race)
const isPast = computed(() => race.value.at < now.value)
const previous = computed(() => detail.value?.previous ?? null)
const next = computed(() => detail.value?.next ?? null)

// ← / → pour passer d'une manche à l'autre
defineShortcuts({
  arrowleft: () => previous.value && navigateTo(`/courses/${previous.value.round}`),
  arrowright: () => next.value && navigateTo(`/courses/${next.value.round}`),
})

const eyebrow = computed(() => {
  const parts = [`Saison ${race.value.season}`, `Manche ${race.value.round}`]
  if (race.value.hasSprint)
    parts.push('Week-end sprint')
  return parts.join(' · ')
})

const tabs = computed<TabsItem[]>(() => {
  const items: TabsItem[] = [
    { label: 'Course', value: 'race', slot: 'race' },
    { label: 'Qualifications', value: 'qualifying', slot: 'qualifying' },
  ]
  if (race.value.hasSprint)
    items.push({ label: 'Sprint', value: 'sprint', slot: 'sprint' })
  return items
})

// Premier onglet qui a des résultats, sinon la course
const defaultTab = computed(() => {
  if (detail.value?.results)
    return 'race'
  if (detail.value?.sprint)
    return 'sprint'
  if (detail.value?.qualifying)
    return 'qualifying'
  return 'race'
})

function pendingLabel(key: string) {
  const session = race.value.sessions.find(s => s.key === key)
  if (!session)
    return 'Résultats non disponibles.'
  return `Résultats disponibles après la séance du ${formatWeekday(session.at)}${session.hasTime ? ` à ${formatTime(session.at)}` : ''}.`
}

useSeoMeta({
  title: () => raceName(race.value.name),
})
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-6 flex items-center justify-between gap-4 text-sm">
      <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-muted hover:text-highlighted">
        <UIcon name="i-lucide-arrow-left" class="size-4" />
        Calendrier
      </NuxtLink>
      <RaceNav :previous="previous" :next="next" compact />
    </div>

    <PageHeader
      :eyebrow="eyebrow"
      :title="raceName(race.name)"
      :description="`${race.circuit.name}, ${race.circuit.locality} — ${countryName(race.circuit.country)}`"
    >
      <template #right>
        <template v-if="isPast">
          Course disputée le {{ formatDate(race.at, { day: 'numeric', month: 'long' }) }}
        </template>
        <template v-else>
          Départ dans <CountdownTimer :target="race.at" class="text-highlighted" />
        </template>
      </template>
    </PageHeader>

    <div class="grid gap-x-16 gap-y-10 lg:grid-cols-[1fr_22rem]">
      <div class="min-w-0 lg:order-1">
        <UTabs :items="tabs" variant="link" color="neutral" :default-value="defaultTab" :unmount-on-hide="false">
          <template #race>
            <ResultsTable v-if="detail?.results" :results="detail.results" class="mt-6" />
            <p v-else class="mt-6 text-sm text-muted">
              {{ pendingLabel('race') }}
            </p>
          </template>

          <template #qualifying>
            <QualifyingTable v-if="detail?.qualifying" :results="detail.qualifying" class="mt-6" />
            <p v-else class="mt-6 text-sm text-muted">
              {{ pendingLabel('qualifying') }}
            </p>
          </template>

          <template #sprint>
            <ResultsTable v-if="detail?.sprint" :results="detail.sprint" class="mt-6" />
            <p v-else class="mt-6 text-sm text-muted">
              {{ pendingLabel('sprint') }}
            </p>
          </template>
        </UTabs>
      </div>

      <aside class="space-y-10 lg:order-2">
        <CircuitMap v-if="detail?.circuitMap" :map="detail.circuitMap" :name="race.circuit.name" />

        <div>
          <h2 class="mb-3 text-sm font-medium text-muted">
            Programme du week-end
          </h2>
          <SessionList :sessions="race.sessions" />
        </div>
      </aside>
    </div>

    <RaceNav :previous="previous" :next="next" class="mt-16" />
  </UContainer>
</template>
