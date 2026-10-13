<script setup lang="ts">
const props = defineProps<{
  /** ISO 8601 */
  target: string
}>()

// Rendu « — » côté serveur et jusqu'au montage, pour éviter tout écart d'hydratation
const now = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  now.value = Date.now()
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => clearInterval(timer))

const label = computed(() => {
  if (now.value === null)
    return '—'
  const diff = new Date(props.target).getTime() - now.value
  if (diff <= 0)
    return 'en cours'

  const pad = (n: number) => String(n).padStart(2, '0')
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1000)

  // Les secondes n'ont d'intérêt que le jour même
  return days > 0
    ? `${days} j ${pad(hours)} h ${pad(minutes)} min`
    : `${pad(hours)} h ${pad(minutes)} min ${pad(seconds)} s`
})
</script>

<template>
  <span class="font-mono tabular-nums">{{ label }}</span>
</template>
