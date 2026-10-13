<script setup lang="ts">
import type { RaceLink } from '#shared/types/f1'

defineProps<{
  previous: RaceLink | null
  next: RaceLink | null
  /** Version resserrée pour l'en-tête : flèches seules, nom au survol */
  compact?: boolean
}>()
</script>

<template>
  <nav v-if="compact" class="flex items-center gap-1" aria-label="Manche précédente ou suivante">
    <UTooltip :text="previous ? `Manche ${previous.round} · ${raceName(previous.name)}` : 'Première manche'" :kbds="['←']">
      <UButton
        :to="previous ? `/courses/${previous.round}` : undefined"
        :disabled="!previous"
        icon="i-lucide-chevron-left"
        color="neutral"
        variant="ghost"
        size="sm"
        aria-label="Manche précédente"
      />
    </UTooltip>
    <UTooltip :text="next ? `Manche ${next.round} · ${raceName(next.name)}` : 'Dernière manche'" :kbds="['→']">
      <UButton
        :to="next ? `/courses/${next.round}` : undefined"
        :disabled="!next"
        icon="i-lucide-chevron-right"
        color="neutral"
        variant="ghost"
        size="sm"
        aria-label="Manche suivante"
      />
    </UTooltip>
  </nav>

  <nav v-else class="grid gap-4 border-t border-default pt-6 sm:grid-cols-2" aria-label="Manche précédente ou suivante">
    <NuxtLink
      v-if="previous"
      :to="`/courses/${previous.round}`"
      class="group flex items-center gap-3 text-sm"
    >
      <UIcon name="i-lucide-arrow-left" class="size-4 shrink-0 text-muted transition-colors group-hover:text-highlighted" />
      <span class="min-w-0">
        <span class="block text-xs text-muted">Manche {{ previous.round }}</span>
        <span class="block truncate font-medium text-highlighted underline-offset-4 group-hover:underline">{{ raceName(previous.name) }}</span>
      </span>
    </NuxtLink>
    <span v-else />

    <NuxtLink
      v-if="next"
      :to="`/courses/${next.round}`"
      class="group flex items-center justify-end gap-3 text-right text-sm"
    >
      <span class="min-w-0">
        <span class="block text-xs text-muted">Manche {{ next.round }}</span>
        <span class="block truncate font-medium text-highlighted underline-offset-4 group-hover:underline">{{ raceName(next.name) }}</span>
      </span>
      <UIcon name="i-lucide-arrow-right" class="size-4 shrink-0 text-muted transition-colors group-hover:text-highlighted" />
    </NuxtLink>
  </nav>
</template>
