// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
    timeline: {
      enabled: false,
    },
  },
  imports: {
    dirs: ['data', 'constants'],
  },
  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@vueuse/nuxt',
    '@nuxt/ui',
    'dayjs-nuxt',
    '@nuxt/eslint',
  ],
  dayjs: {
    locales: ['es', 'en'],
    plugins: ['relativeTime', 'utc', 'timezone', 'duration', 'weekOfYear', 'isBetween', 'isoWeek', 'dayOfYear'],
    defaultLocale: 'en',
    defaultTimezone: 'UTC',
  },
  eslint: {
    config: {
      stylistic: true,
    },
    checker: true,
  },
  ssr: false,
  app: {
    head: {
      script: [
        { 'src': 'https://analytics.io.bryan-web.dev/script.js', 'defer': true, 'data-website-id': '9ed946b1-9576-4798-890d-ce6e6b30f2ab' },
      ],
    },
  },
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: '',
    dataValue: 'light',
  },
})
