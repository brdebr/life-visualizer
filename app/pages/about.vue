<template>
  <UCard class="container mx-auto">
    <div class="prose app-text mx-auto text-center">
      <p>
        This is a simple application to visualize your whole life like a Github contributions heatmap.
      </p>
      <p>
        It's built with:
      </p>
      <ul>
        <li
          v-for="tech in techList"
          :key="tech.label"
        >
          <a
            :href="tech.url"
            target="_blank"
            rel="noopener noreferrer"
          >{{ tech.label }}</a>
        </li>
      </ul>
      <p class="text-sm">
        Version deployed: {{ runtimeConfig.public.gitHash }}
      </p>
      <p class="text-sm">
        Commit date: {{ appVersionDate }} | Days since last commit: {{ daysSinceLastCommit }}
      </p>
      <UButton
        color="red"
        @click="clearLocalStorage"
      >
        Clean local storage
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()

const clearLocalStorage = () => {
  const setupStoreData = window.localStorage.getItem('setup-store')
  window.localStorage.clear()
  if (setupStoreData) {
    window.localStorage.setItem('setup-store', setupStoreData)
  }
  window.location.href = '/'
}

const techList = [
  {
    label: 'Nuxt 3',
    url: 'https://v3.nuxtjs.org/',
  },
  {
    label: 'Tailwind CSS',
    url: 'https://tailwindcss.com/',
  },
  {
    label: 'Nuxt UI components',
    url: 'https://ui.nuxt.com/',
  },
  {
    label: 'DayJs',
    url: 'https://day.js.org/',
  },
  {
    label: 'Pinia',
    url: 'https://pinia.vuejs.org/',
  },
  {
    label: 'VueTippy',
    url: 'https://vue-tippy.netlify.app/',
  },
]
const dayjs = useDayjs()
const configs = useRuntimeConfig()
const appVersionDate = configs.public.gitCommitDate
const daysSinceLastCommit = dayjs().diff(dayjs(appVersionDate), 'day')
</script>
