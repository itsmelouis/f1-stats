<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const { data: standings, error } = await useFetch('/api/standings')

if (error.value || !standings.value) {
  throw createError({ statusCode: 502, message: 'Impossible de charger les classements', fatal: true })
}

const drivers = computed(() => standings.value!.drivers)
const constructors = computed(() => standings.value!.constructors)

const tabs: TabsItem[] = [
  { label: 'Pilotes', value: 'drivers', slot: 'drivers' },
  { label: 'Constructeurs', value: 'constructors', slot: 'constructors' },
]

useSeoMeta({
  title: 'Classements',
})
</script>

<template>
  <UContainer class="py-10">
    <PageHeader :eyebrow="`Saison ${drivers.season}`" title="Classements">
      <template #right>
        Après {{ drivers.round }} manche{{ drivers.round > 1 ? 's' : '' }}
      </template>
    </PageHeader>

    <UTabs :items="tabs" variant="link" color="neutral" default-value="drivers" :unmount-on-hide="false">
      <template #drivers>
        <DriverStandingsTable :items="drivers.items" class="mt-6" />
      </template>
      <template #constructors>
        <ConstructorStandingsTable :items="constructors.items" class="mt-6" />
      </template>
    </UTabs>
  </UContainer>
</template>
