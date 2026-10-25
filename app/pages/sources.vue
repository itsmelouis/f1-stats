<script setup lang="ts">
interface Source {
  name: string
  url: string
  usage: string
  license: { label: string, url: string }
}

const sources: Source[] = [
  {
    name: 'Jolpica F1',
    url: 'https://api.jolpi.ca',
    usage: 'Calendrier, horaires des sessions, résultats, qualifications, sprints et classements. Source principale du site.',
    license: { label: 'CC BY-NC-SA 4.0', url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr' },
  },
  {
    name: 'OpenF1',
    url: 'https://openf1.org',
    usage: 'Résultats du week-end en cours, en attendant que Jolpica les publie (souvent le lendemain). Disponibles 30 minutes après la fin de chaque session.',
    license: { label: 'non commerciale', url: 'https://openf1.org' },
  },
  {
    name: 'bacinger/f1-circuits',
    url: 'https://github.com/bacinger/f1-circuits',
    usage: 'Tracés des circuits, issus d\'OpenStreetMap, redessinés en SVG.',
    license: { label: 'MIT', url: 'https://github.com/bacinger/f1-circuits/blob/master/LICENSE.md' },
  },
]

useSeoMeta({
  title: 'Sources',
})
</script>

<template>
  <UContainer class="max-w-3xl py-10">
    <PageHeader title="Sources" description="D'où viennent les données affichées sur ce site." />

    <ul class="border-t border-default">
      <li v-for="source in sources" :key="source.name" class="grid gap-x-8 gap-y-2 border-b border-default py-6 sm:grid-cols-[12rem_1fr]">
        <div>
          <ULink :to="source.url" target="_blank" class="font-medium text-highlighted underline underline-offset-4">
            {{ source.name }}
          </ULink>
        </div>
        <div class="space-y-2 text-sm">
          <p class="text-default">
            {{ source.usage }}
          </p>
          <p class="text-muted">
            Licence
            <ULink :to="source.license.url" target="_blank" class="underline underline-offset-2 hover:text-highlighted">
              {{ source.license.label }}
            </ULink>
          </p>
        </div>
      </li>
    </ul>

    <div class="mt-10 space-y-3 text-sm text-muted">
      <p>
        Les données sont reformatées (heures de Paris, libellés en français) et mises en cache quelques minutes pour ménager les API.
        Les résultats d'OpenF1 n'indiquent ni la grille de départ ni le meilleur tour : ces colonnes se complètent quand Jolpica prend le relais.
      </p>
      <p>
        Site personnel et non commercial, sans lien avec Formula One Licensing BV ni avec la FIA.
        F1, FORMULA ONE et FORMULA 1 sont des marques de Formula One Licensing BV.
      </p>
    </div>
  </UContainer>
</template>
