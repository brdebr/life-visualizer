// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/ui',
    'dayjs-nuxt',
  ],
  dayjs: {
    locales: ['es', 'en'],
    plugins: ['relativeTime', 'utc', 'timezone', 'duration', 'weekOfYear'],
    defaultLocale: 'en',
    defaultTimezone: 'Europe/Madrid',
  }
})
