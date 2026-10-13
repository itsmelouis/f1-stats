<script setup lang="ts">
import type { QualifyingResult } from '#shared/types/f1'

defineProps<{
  results: QualifyingResult[]
}>()
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
          <th class="f1-num">
            Q1
          </th>
          <th class="f1-num">
            Q2
          </th>
          <th class="f1-num">
            Q3
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="result in results" :key="result.driver.id">
          <td>
            <PositionCell :position="result.position" />
          </td>
          <td class="max-w-64">
            <DriverName :driver="result.driver" :constructor="result.constructor" />
          </td>
          <td class="hidden text-muted md:table-cell">
            {{ result.constructor.name }}
          </td>
          <td class="f1-num" :class="result.q1 ? 'text-muted' : 'text-dimmed'">
            {{ result.q1 ?? '–' }}
          </td>
          <td class="f1-num" :class="result.q2 ? 'text-muted' : 'text-dimmed'">
            {{ result.q2 ?? '–' }}
          </td>
          <td class="f1-num" :class="result.q3 ? 'font-semibold text-highlighted' : 'text-dimmed'">
            {{ result.q3 ?? '–' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
