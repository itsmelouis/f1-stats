<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const [{ data: drivers, error: driversError }, { data: constructors, error: constructorsError }] = await Promise.all([
  useFetch('/api/standings/drivers'),
  useFetch('/api/standings/constructors'),
])

if (driversError.value || constructorsError.value) {
  throw createError({ statusCode: 502, message: 'Impossible de charger les classements', fatal: true })
}

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
    <PageHeader :eyebrow="`Saison ${drivers?.season}`" title="Classements">
      <template #right>
        Après {{ drivers?.round }} manche{{ (drivers?.round ?? 0) > 1 ? 's' : '' }}
      </template>
    </PageHeader>

    <UTabs :items="tabs" variant="link" color="neutral" default-value="drivers" :unmount-on-hide="false">
      <template #drivers>
        <DriverStandingsTable v-if="drivers" :items="drivers.items" class="mt-6" />
      </template>
      <template #constructors>
        <ConstructorStandingsTable v-if="constructors" :items="constructors.items" class="mt-6" />
      </template>
    </UTabs>
  </UContainer>
</template>
