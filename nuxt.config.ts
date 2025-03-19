import { execSync } from 'child_process'

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

  runtimeConfig: {
    public: {
      gitHash: execSync('git rev-parse HEAD').toString().trim().slice(0, 6) || 'unknown',
      gitCommitDate: execSync('git log -1 --format=%cd --date=format:%Y-%m-%d').toString().trim() || 'unknown',
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2025-03-15',

  nitro: isNetlify()
    ? {
        preset: 'netlify-static',
      }
    : undefined,

  dayjs: {
    locales: ['es', 'en'],
    plugins: [
      'relativeTime',
      'utc',
      'timezone',
      'duration',
      'weekOfYear',
      'isBetween',
      'isoWeek',
      'dayOfYear',
      'isSameOrBefore',
    ],
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
