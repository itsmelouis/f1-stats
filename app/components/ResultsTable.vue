<script setup lang="ts">
import type { SessionResult } from '#shared/types/f1'

const props = defineProps<{
  results: SessionResult[]
}>()

const winner = computed(() => props.results.find(r => r.position === 1))
</script>

<template>
  <div class="overflow-x-auto">
    <table class="f1-table">
      <thead>
        <tr>
          <th class="w-10">
            Pos
          </th>
          <th>Pilote</th>
          <th class="hidden md:table-cell">
            Écurie
          </th>
          <th class="f1-num hidden sm:table-cell">
            Grille
          </th>
          <th class="f1-num hidden sm:table-cell">
            Tours
          </th>
          <th class="f1-num">
            Temps / Écart
          </th>
          <th class="f1-num">
            Pts
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="result in results" :key="result.driver.id">
          <td>
            <PositionCell :position="isClassified(result) ? result.position : null" :text="result.positionText" />
          </td>
          <td class="max-w-64">
            <DriverName :driver="result.driver" :constructor="result.constructor" />
          </td>
          <td class="hidden text-muted md:table-cell">
            {{ result.constructor.name }}
          </td>
          <td class="f1-num hidden text-muted sm:table-cell">
            {{ result.grid || '–' }}
          </td>
          <td class="f1-num hidden text-muted sm:table-cell">
            {{ result.laps }}
          </td>
          <td class="f1-num whitespace-nowrap" :class="isClassified(result) ? 'text-highlighted' : 'text-muted'">
            <abbr
              v-if="result.fastestLap?.rank === 1"
              :title="`Meilleur tour en course : ${result.fastestLap.time} (tour ${result.fastestLap.lap})`"
              class="mr-2 text-xs text-violet-600 no-underline dark:text-violet-400"
            >MT</abbr>{{ resultTimeLabel(result, winner) }}
          </td>
          <td class="f1-num" :class="result.points > 0 ? 'font-semibold text-highlighted' : 'text-dimmed'">
            {{ formatPoints(result.points) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
