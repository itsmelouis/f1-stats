<script setup lang="ts">
const title = 'F1 Stats'
const description = 'Calendrier, résultats et classements de la saison de Formule 1 en cours.'

useSeoMeta({
  titleTemplate: '%s · F1 Stats',
  description,
  ogTitle: title,
  ogDescription: description,
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator color="#E10600" />
    <div class="flex min-h-dvh flex-col bg-default text-default">
      <AppHeader />
      <main class="flex-1">
        <NuxtPage />
      </main>
      <AppFooter />
    </div>
  </UApp>
</template>
