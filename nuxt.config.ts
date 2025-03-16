const isNetlify = () => process.env.NETLIFY === 'true'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@vueuse/nuxt',
    '@nuxt/ui',
    'dayjs-nuxt',
    '@nuxt/eslint',
  ],

  ssr: false,

  imports: {
    dirs: ['data', 'constants'],
  },
  devtools: {
    enabled: true,
    timeline: {
      enabled: false,
    },
  },

  app: {
    head: {
      script: isNetlify()
        ? [
            { 'src': 'https://analytics.io.bryan-web.dev/script.js', 'defer': true, 'data-website-id': '9ed946b1-9576-4798-890d-ce6e6b30f2ab' },
          ]
        : [],
    },
  },

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: '',
    dataValue: 'light',
  },

  compatibilityDate: '2025-03-15',

  nitro: isNetlify()
    ? {
        preset: 'netlify-static',
      }
    : undefined,

  dayjs: {
    locales: ['es', 'en'],
    plugins: ['relativeTime', 'utc', 'timezone', 'duration', 'weekOfYear', 'isBetween', 'isoWeek', 'dayOfYear'],
    defaultLocale: 'en',
    defaultTimezone: 'UTC',
    externalPlugins: [
      {
        name: 'dayjsBusinessDays',
        package: 'dayjs-business-days2',
      },
    ],
  },

  eslint: {
    config: {
      stylistic: true,
    },
    checker: true,
  },
})
