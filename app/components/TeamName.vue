<script setup lang="ts">
import type { Constructor } from '#shared/types/f1'

defineProps<{
  constructor: Constructor
  emphasis?: boolean
}>()
</script>

<template>
  <span class="inline-flex min-w-0 items-center gap-3">
    <span
      class="h-5 w-0.5 shrink-0"
      :style="{ backgroundColor: teamColor(constructor.id) }"
      aria-hidden="true"
    />
    <span class="truncate" :class="emphasis ? 'font-medium text-highlighted' : 'text-default'">{{ constructor.name }}</span>
  </span>
</template>
