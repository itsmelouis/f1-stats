<script setup lang="ts">
import type { CircuitMap } from '#shared/types/f1'

const props = defineProps<{
  map: CircuitMap
  name: string
}>()

const open = ref(false)
const figure = useTemplateRef<HTMLElement>('figure')

const label = computed(() => `Tracé du circuit ${props.name}`)

defineShortcuts({
  escape: () => {
    open.value = false
  },
})

// Zoom « depuis sa place » : on anime le tracé agrandi depuis la position de la vignette
const EASING = 'cubic-bezier(0.2, 0, 0, 1)'

function transformFromFigure(target: HTMLElement) {
  const from = figure.value!.getBoundingClientRect()
  const to = target.getBoundingClientRect()
  const dx = from.left + from.width / 2 - (to.left + to.width / 2)
  const dy = from.top + from.height / 2 - (to.top + to.height / 2)
  return `translate(${dx}px, ${dy}px) scale(${from.width / to.width})`
}

function onEnter(el: Element, done: () => void) {
  const target = el.querySelector<HTMLElement>('[data-zoom]')!
  target.animate([{ transform: transformFromFigure(target) }, { transform: 'none' }], { duration: 320, easing: EASING })
    .finished
    .then(done)
}

function onLeave(el: Element, done: () => void) {
  const target = el.querySelector<HTMLElement>('[data-zoom]')!
  target.animate([{ transform: 'none' }, { transform: transformFromFigure(target) }], { duration: 260, easing: EASING })
    .finished
    .then(done)
}
</script>

<template>
  <figure>
    <button
      ref="figure"
      type="button"
      class="block w-full cursor-zoom-in rounded-md outline-primary/40 transition-opacity focus-visible:outline-2"
      :class="open && 'opacity-0'"
      :aria-label="`Agrandir le ${label.toLowerCase()}`"
      @click="open = true"
    >
      <svg :viewBox="map.viewBox" role="img" :aria-label="label" class="max-h-80 w-full text-highlighted">
        <path :d="map.path" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
        <circle :cx="map.start.x" :cy="map.start.y" r="7" class="fill-primary" />
      </svg>
    </button>
    <figcaption class="mt-2 flex justify-between gap-4 text-xs text-dimmed">
      <span>
        Tracé<template v-if="map.length"> · {{ (map.length / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 3 }) }} km</template>
      </span>
      <ULink :to="map.sourceUrl" target="_blank" class="underline underline-offset-2 hover:text-muted">
        Données OpenStreetMap
      </ULink>
    </figcaption>

    <Teleport to="body">
      <Transition :css="false" @enter="onEnter" @leave="onLeave">
        <div
          v-if="open"
          class="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-default/90 p-6 backdrop-blur-sm"
          role="dialog"
          :aria-label="label"
          @click="open = false"
        >
          <div data-zoom class="w-full max-w-4xl">
            <svg :viewBox="map.viewBox" class="max-h-[85vh] w-full text-highlighted">
              <path :d="map.path" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
              <circle :cx="map.start.x" :cy="map.start.y" r="7" class="fill-primary" />
            </svg>
          </div>
        </div>
      </Transition>
    </Teleport>
  </figure>
</template>
