<script setup lang="ts">
import type { Constructor } from '#shared/types/f1'

// `constructor` dans un slot de template est résolu en `Object` : on passe par `props`
const props = defineProps<{
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
    <NuxtLink
      :to="`/ecuries/${constructor.id}`"
      class="truncate hover:underline hover:underline-offset-4"
      :class="emphasis ? 'font-medium text-highlighted' : 'text-default'"
    >
      {{ props.constructor.name }}
    </NuxtLink>
  </span>
</template>
