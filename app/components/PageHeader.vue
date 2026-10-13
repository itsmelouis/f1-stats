<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<template>
  <div class="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-default pb-6">
    <div class="min-w-0">
      <p v-if="eyebrow" class="text-sm text-muted">
        {{ eyebrow }}
      </p>
      <h1 class="mt-1 text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
        <slot name="title">
          {{ title }}
        </slot>
      </h1>
      <p v-if="description" class="mt-2 text-muted">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.right" class="shrink-0 text-sm text-muted tabular-nums">
      <slot name="right" />
    </div>
  </div>
</template>
