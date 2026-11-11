<script setup lang="ts">
import type { Race, SessionResult } from '#shared/types/f1'

const props = defineProps<{
  race: Race
  /** `null` tant que les résultats ne sont pas publiés */
  results: SessionResult[] | null
}>()

const podium = computed(() => (props.results ?? []).slice(0, 3))
</script>

<template>
  <section class="mb-14 grid gap-x-16 gap-y-6 border-t border-default pt-8 lg:grid-cols-[1fr_22rem]">
    <div>
      <p class="text-sm font-medium text-muted">
        Dernière course · Manche {{ race.round }}
      </p>
      <h2 class="mt-2 text-2xl font-semibold tracking-tight text-highlighted">
        {{ raceName(race.name) }}
      </h2>
      <p class="mt-1 text-muted">
        {{ race.circuit.locality }}, {{ countryName(race.circuit.country) }} — {{ formatDate(race.at, { weekday: 'long', day: 'numeric', month: 'long' }) }}
      </p>
      <NuxtLink
        :to="`/courses/${race.round}`"
        class="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-highlighted underline-offset-4 hover:underline"
      >
        Résultats complets
        <UIcon name="i-lucide-arrow-right" class="size-4" />
      </NuxtLink>
    </div>

    <div>
      <h3 class="mb-3 text-sm font-medium text-muted">
        Podium
      </h3>
      <ol v-if="podium.length" class="divide-y divide-default border-y border-default text-sm">
        <li v-for="result in podium" :key="result.driver.id" class="flex items-center gap-3 py-2.5">
          <PositionCell :position="result.position" class="w-5 shrink-0" />
          <DriverName :driver="result.driver" :constructor="result.constructor" class="min-w-0 flex-1" />
          <span class="shrink-0 font-mono text-muted tabular-nums">{{ resultTimeLabel(result, podium[0]) }}</span>
        </li>
      </ol>
      <p v-else class="text-sm text-muted">
        Résultats pas encore publiés.
      </p>
    </div>
  </section>
</template>
