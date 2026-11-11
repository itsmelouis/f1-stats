<script setup lang="ts">
const props = defineProps<{
  /** Saisons proposées, de la plus récente à la plus ancienne */
  seasons: string[]
}>()

const route = useRoute()

/** Saison choisie dans `?saison=`, `null` pour toute la carrière */
const selected = computed({
  get: () => (typeof route.query.saison === 'string' ? route.query.saison : 'all'),
  set: value => navigateTo({ query: value === 'all' ? {} : { saison: value } }),
})

const items = computed(() => [
  { label: 'Toute la carrière', value: 'all' },
  ...props.seasons.map(season => ({ label: `Saison ${season}`, value: season })),
])
</script>

<template>
  <USelect v-model="selected" :items="items" color="neutral" class="w-48" aria-label="Saison" />
</template>
