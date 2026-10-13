// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
  ],

  devtools: {
    enabled: true,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [{ rel: 'icon', href: '/favicon.ico' }],
    },
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'system',
    fallback: 'dark',
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      // Les règles de base (TS, Vue, style) viennent de @antfu/eslint-config,
      // le module ne fournit que les règles propres à Nuxt.
      standalone: false,
    },
  },
})
