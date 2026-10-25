<script setup lang="ts">
import type { Race } from '#shared/types/f1'

defineProps<{
  race: Race
}>()
</script>

<template>
  <section class="mb-14 grid gap-x-16 gap-y-8 lg:grid-cols-[1fr_22rem]">
    <div>
      <p class="text-sm font-medium text-primary">
        Prochaine course · Manche {{ race.round }}
      </p>
      <h2 class="mt-2 text-3xl font-semibold tracking-tight text-highlighted sm:text-5xl">
        {{ raceName(race.name) }}
      </h2>
      <p class="mt-2 text-muted">
        <a
          :href="circuitMapsUrl(race.circuit)"
          target="_blank"
          rel="noopener noreferrer"
          class="underline decoration-(--ui-border-accented) underline-offset-4 hover:text-highlighted hover:decoration-current"
        >{{ race.circuit.name }}, {{ race.circuit.locality }}</a> — {{ countryName(race.circuit.country) }}
      </p>

      <dl class="mt-8 flex flex-wrap gap-x-12 gap-y-4">
        <div>
          <dt class="text-sm text-muted">
            Départ dans
          </dt>
          <dd class="mt-0.5 text-2xl font-semibold text-highlighted">
            <CountdownTimer :target="race.at" />
          </dd>
        </div>
        <div>
          <dt class="text-sm text-muted">
            Course
          </dt>
          <dd class="mt-0.5 text-2xl font-semibold text-highlighted">
            {{ formatWeekday(race.at) }}, {{ formatTime(race.at) }}
          </dd>
        </div>
      </dl>

      <NuxtLink
        :to="`/courses/${race.round}`"
        class="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-highlighted underline-offset-4 hover:underline"
      >
        Détail de la manche
        <UIcon name="i-lucide-arrow-right" class="size-4" />
      </NuxtLink>
    </div>

    <div>
      <h3 class="mb-3 text-sm font-medium text-muted">
        Programme du week-end
      </h3>
      <SessionList :sessions="race.sessions" />
    </div>
  </section>
</template>
