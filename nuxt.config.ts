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
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#ffffff' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#15151E' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'system',
    fallback: 'dark',
  },

  nitro: {
    // Déployé sur Cloudflare Workers (config dans wrangler.jsonc)
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
    // Cache des appels API : KV en production, fichiers en dev
    storage: {
      cache: { driver: 'cloudflare-kv-binding', binding: 'CACHE' },
    },
    devStorage: {
      cache: { driver: 'fs', base: '.nuxt/cache' },
    },
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
