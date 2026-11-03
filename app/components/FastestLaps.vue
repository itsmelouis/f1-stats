<script setup lang="ts">
import type { FastestLap, SessionResult } from '#shared/types/f1'

const props = withDefaults(defineProps<{
  results: SessionResult[]
  count?: number
}>(), { count: 3 })

interface Entry {
  result: SessionResult
  fastestLap: FastestLap
  millis: number | null
}

/** Top N des meilleurs tours : tri par temps, le rang de l'API départage les temps illisibles */
const entries = computed<Entry[]>(() =>
  props.results
    .filter((result): result is SessionResult & { fastestLap: FastestLap } => result.fastestLap !== null)
    .map(result => ({ result, fastestLap: result.fastestLap, millis: lapTimeToMillis(result.fastestLap.time) }))
    .sort((a, b) => {
      if (a.millis !== null && b.millis !== null && a.millis !== b.millis)
        return a.millis - b.millis
      return (a.fastestLap.rank || Infinity) - (b.fastestLap.rank || Infinity)
    })
    .slice(0, props.count),
)

const best = computed(() => entries.value[0]?.millis ?? null)

function gap(entry: Entry) {
  if (best.value === null || entry.millis === null)
    return null
  return entry.millis - best.value
}
</script>

<template>
  <div v-if="entries.length">
    <h2 class="mb-3 text-sm font-medium text-muted">
      Meilleurs tours en course
    </h2>
    <ol class="divide-y divide-default border-y border-default text-sm">
      <li
        v-for="(entry, index) in entries"
        :key="entry.result.driver.id"
        class="flex items-center gap-3 py-2.5"
      >
        <PositionCell :position="index + 1" class="w-5 shrink-0" />
        <DriverName :driver="entry.result.driver" :constructor="entry.result.constructor" class="min-w-0 flex-1" />
        <span class="shrink-0 text-right font-mono tabular-nums">
          <span :class="index === 0 ? 'font-semibold text-violet-600 dark:text-violet-400' : 'text-highlighted'">{{ entry.fastestLap.time }}</span>
          <span class="block text-xs text-muted">
            <template v-if="index > 0 && gap(entry) !== null">{{ formatGap(gap(entry)!) }} · </template>tour {{ entry.fastestLap.lap }}
          </span>
        </span>
      </li>
    </ol>
  </div>
</template>
