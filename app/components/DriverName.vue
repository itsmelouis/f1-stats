<script setup lang="ts">
import type { Constructor, Driver } from '#shared/types/f1'

defineProps<{
  driver: Driver
  constructor: Constructor
}>()
</script>

<template>
  <span class="flex min-w-0 items-center gap-3">
    <span
      class="h-5 w-0.5 shrink-0"
      :style="{ backgroundColor: teamColor(constructor.id) }"
      aria-hidden="true"
    />
    <NuxtLink :to="`/pilotes/${driver.id}`" class="truncate hover:underline hover:underline-offset-4">
      <span class="text-muted">{{ driver.firstName }}&nbsp;</span>
      <span class="font-medium uppercase text-highlighted">{{ driver.lastName }}</span>
    </NuxtLink>
  </span>
</template>
