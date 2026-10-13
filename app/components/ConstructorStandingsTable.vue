<script setup lang="ts">
import type { ConstructorStanding } from '#shared/types/f1'

const props = defineProps<{
  items: ConstructorStanding[]
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
          <th>Écurie</th>
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
        <tr v-for="item in items" :key="item.constructor.id">
          <td>
            <PositionCell :position="item.position" />
          </td>
          <td>
            <TeamName :constructor="item.constructor" emphasis />
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
