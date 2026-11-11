<script setup lang="ts">
defineProps<{
  items: { label: string, value: string | number }[]
}>()
</script>

<template>
  <dl class="grid grid-cols-3 gap-y-6 border-b border-default pb-6 sm:grid-cols-6">
    <div v-for="item in items" :key="item.label">
      <dt class="text-xs text-muted">
        {{ item.label }}
      </dt>
      <dd class="mt-1 font-mono text-2xl font-semibold text-highlighted tabular-nums">
        {{ item.value }}
      </dd>
    </div>
  </dl>
</template>
