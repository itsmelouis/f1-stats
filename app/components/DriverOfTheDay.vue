<script setup lang="ts">
import type { DriverOfTheDayVote } from '#shared/types/f1'

defineProps<{
  votes: DriverOfTheDayVote[]
}>()
</script>

<template>
  <div>
    <h2 class="mb-3 flex items-baseline justify-between gap-4 text-sm font-medium text-muted">
      Pilote du jour
      <span class="text-xs font-normal">Vote des fans</span>
    </h2>
    <ol class="divide-y divide-default border-y border-default text-sm">
      <li
        v-for="(vote, index) in votes"
        :key="vote.driver.id"
        class="flex items-center gap-3 py-2.5"
      >
        <PositionCell :position="index + 1" class="w-5 shrink-0" />
        <DriverName :driver="vote.driver" :constructor="vote.constructor" class="min-w-0 flex-1" />
        <span class="shrink-0 font-mono tabular-nums" :class="index === 0 ? 'font-semibold text-highlighted' : 'text-muted'">
          {{ formatPercent(vote.percentage) }}
        </span>
      </li>
    </ol>
  </div>
</template>
