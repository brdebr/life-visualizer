// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
    timeline: {
      enabled: false,
    },
  },
  imports: {
    dirs: ['data'],
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
})
