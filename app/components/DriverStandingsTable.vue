<script setup lang="ts">
import type { DriverStanding } from '#shared/types/f1'

const props = defineProps<{
  items: DriverStanding[]
}>()

const leaderPoints = computed(() => props.items[0]?.points ?? 0)
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
            Victoires
          </th>
          <th class="f1-num hidden sm:table-cell">
            Podiums
          </th>
          <th class="f1-num">
            Points
          </th>
          <th class="f1-num hidden sm:table-cell">
            Écart
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.driver.id">
          <td>
            <PositionCell :position="item.position" />
          </td>
          <td class="max-w-64">
            <DriverName :driver="item.driver" :constructor="item.constructor" />
          </td>
          <td class="hidden text-muted md:table-cell">
            {{ item.constructor.name }}
          </td>
          <td class="f1-num hidden sm:table-cell" :class="item.wins ? 'text-muted' : 'text-dimmed'">
            {{ item.wins }}
          </td>
          <td class="f1-num hidden sm:table-cell" :class="item.podiums ? 'text-muted' : 'text-dimmed'">
            {{ item.podiums }}
          </td>
          <td class="f1-num font-semibold text-highlighted">
            {{ formatPoints(item.points) }}
          </td>
          <td class="f1-num hidden text-muted sm:table-cell">
            {{ item.position === 1 ? '' : `−${formatPoints(leaderPoints - item.points)}` }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
