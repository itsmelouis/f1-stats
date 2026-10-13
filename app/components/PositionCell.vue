<script setup lang="ts">
defineProps<{
  position: number | null
  /** Texte brut de l'API (ex. « R » pour abandon) */
  text?: string
}>()
</script>

<template>
  <span
    class="font-mono text-sm tabular-nums"
    :class="position === null ? 'text-dimmed' : position <= 3 ? 'font-semibold text-highlighted' : 'text-muted'"
  >
    {{ position ?? (text || '–') }}
  </span>
</template>
