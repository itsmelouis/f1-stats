<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Saisons proposées, de la plus récente à la plus ancienne */
  seasons: string[]
  /** Libellé du choix par défaut, sans `?saison=` */
  defaultLabel?: string
}>(), { defaultLabel: 'Toute la carrière' })

const route = useRoute()

/** Saison choisie dans `?saison=`, `all` pour le choix par défaut */
const selected = computed({
  get: () => (typeof route.query.saison === 'string' ? route.query.saison : 'all'),
  set: value => navigateTo({ query: value === 'all' ? {} : { saison: value } }),
})

const items = computed(() => [
  { label: props.defaultLabel, value: 'all' },
  ...props.seasons.map(season => ({ label: `Saison ${season}`, value: season })),
])
</script>

<template>
  <USelect v-model="selected" :items="items" color="neutral" class="w-48" aria-label="Saison" />
</template>
