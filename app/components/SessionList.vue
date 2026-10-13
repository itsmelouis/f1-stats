<script setup lang="ts">
import type { Session } from '#shared/types/f1'

defineProps<{
  sessions: Session[]
}>()
</script>

<template>
  <dl class="divide-y divide-default border-y border-default text-sm">
    <div
      v-for="session in sessions"
      :key="session.key"
      class="flex items-baseline justify-between gap-6 py-2.5"
      :class="session.key === 'race' ? 'font-medium text-highlighted' : 'text-default'"
    >
      <dt>{{ session.label }}</dt>
      <dd class="font-mono text-muted tabular-nums">
        {{ formatDate(session.at, { weekday: 'short', day: 'numeric', month: 'short' }) }}
        <span v-if="session.hasTime" class="ml-2" :class="session.key === 'race' ? 'text-highlighted' : 'text-default'">{{ formatTime(session.at) }}</span>
      </dd>
    </div>
  </dl>
</template>
