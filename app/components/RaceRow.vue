<script setup lang="ts">
import type { Race } from '#shared/types/f1'

defineProps<{
  race: Race
  status: RaceStatus
}>()

const STATUS_LABELS: Record<RaceStatus, string> = {
  past: 'Terminée',
  next: 'Prochaine',
  upcoming: '',
}
</script>

<template>
  <NuxtLink
    :to="`/courses/${race.round}`"
    class="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-x-4 py-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto_5.5rem]"
  >
    <span
      class="font-mono text-sm tabular-nums"
      :class="status === 'next' ? 'font-semibold text-primary' : 'text-dimmed'"
    >
      {{ String(race.round).padStart(2, '0') }}
    </span>

    <span class="min-w-0">
      <span
        class="block truncate font-medium underline-offset-4 group-hover:underline"
        :class="status === 'past' ? 'text-default' : 'text-highlighted'"
      >
        {{ raceName(race.name) }}
        <span v-if="race.hasSprint" class="ml-1.5 text-xs font-normal text-muted">Sprint</span>
      </span>
      <span class="block truncate text-sm text-muted">
        {{ race.circuit.name }}, {{ race.circuit.locality }}
      </span>
    </span>

    <span class="text-right text-sm tabular-nums">
      <span class="block" :class="status === 'past' ? 'text-muted' : 'text-highlighted'">
        {{ formatDate(race.at, { day: 'numeric', month: 'short' }) }}
      </span>
      <span class="block text-xs text-muted">{{ formatTime(race.at) }}</span>
    </span>

    <span
      class="hidden text-right text-xs sm:block"
      :class="status === 'next' ? 'font-medium text-primary' : 'text-dimmed'"
    >
      {{ STATUS_LABELS[status] }}
    </span>
  </NuxtLink>
</template>
