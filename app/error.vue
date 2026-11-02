<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => props.error.statusCode ?? 500)

const titles: Record<number, string> = {
  404: 'Page introuvable',
  429: 'Trop de requêtes',
  500: 'Erreur interne',
  502: 'Données indisponibles',
  503: 'Service indisponible',
}

const descriptions: Record<number, string> = {
  404: 'Cette adresse ne mène nulle part. Le calendrier, les résultats et les classements sont toujours là.',
  429: 'Les sources de données limitent le nombre d\'appels. Réessayez dans quelques instants.',
  502: 'Les sources de données ne répondent pas pour le moment. Réessayez dans quelques instants.',
  503: 'Le site est momentanément indisponible. Réessayez dans quelques instants.',
}

// Nuxt renvoie « Page not found: /chemin » par défaut : on garde seulement les messages écrits par le site
const isNuxtDefault = computed(() => !props.error.message || /^Page not found/i.test(props.error.message))

const title = computed(() => {
  if (!isNuxtDefault.value && statusCode.value !== 500)
    return props.error.message
  return titles[statusCode.value] ?? 'Une erreur est survenue'
})

const description = computed(() => descriptions[statusCode.value] ?? 'Quelque chose s\'est mal passé de notre côté. Réessayez dans quelques instants.')

useSeoMeta({
  title: () => title.value,
})

useHead({
  htmlAttrs: { lang: 'fr' },
})
</script>

<template>
  <UApp>
    <div class="flex min-h-dvh flex-col bg-default text-default">
      <AppHeader />
      <main class="flex flex-1 items-center">
        <UContainer class="max-w-3xl py-16">
          <p class="font-mono text-sm text-muted tabular-nums">
            Erreur {{ statusCode }}
          </p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
            {{ title }}
          </h1>
          <p class="mt-4 max-w-xl text-muted">
            {{ description }}
          </p>

          <div class="mt-10 flex flex-wrap gap-2 border-t border-default pt-6">
            <UButton
              to="/"
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="outline"
              @click.prevent="clearError({ redirect: '/' })"
            >
              Retour au calendrier
            </UButton>
            <UButton
              to="/classements"
              color="neutral"
              variant="ghost"
              @click.prevent="clearError({ redirect: '/classements' })"
            >
              Classements
            </UButton>
            <UButton
              v-if="statusCode !== 404"
              icon="i-lucide-refresh-cw"
              color="neutral"
              variant="ghost"
              @click="clearError()"
            >
              Réessayer
            </UButton>
          </div>
        </UContainer>
      </main>
      <AppFooter />
    </div>
  </UApp>
</template>
