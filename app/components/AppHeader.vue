<script setup lang="ts">
const links = [
  { label: 'Calendrier', to: '/' },
  { label: 'Classements', to: '/classements' },
]
</script>

<template>
  <header class="border-b border-default">
    <div class="h-0.5 bg-primary" aria-hidden="true" />
    <UContainer class="flex h-14 items-center justify-between gap-6">
      <div class="flex items-center gap-8">
        <NuxtLink to="/">
          <AppLogo />
        </NuxtLink>

        <nav class="flex items-center gap-6 text-sm">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="relative py-4 text-muted transition-colors hover:text-highlighted"
            active-class="text-highlighted after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>

      <div class="flex items-center gap-1">
        <UColorModeButton color="neutral" variant="ghost" />
        <UButton
          to="https://github.com/itsmelouis/f1-stats"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </div>
    </UContainer>
  </header>
</template>
