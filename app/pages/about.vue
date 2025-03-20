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
      <div class="flex justify-center space-x-4 mt-4">
        <UButton
          color="red"
          @click="clearLocalStorage"
        >
          Clean local storage
        </UButton>
        <UButton
          color="blue"
          @click="exportData"
        >
          Export data
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ImportEventPayload } from '~/stores/appStore'

const runtimeConfig = useRuntimeConfig()
const eventsStore = useEventsStore()

const clearLocalStorage = () => {
  const setupStoreData = window.localStorage.getItem('setup-store')
  const versionData = window.localStorage.getItem('appVersion')
  window.localStorage.clear()
  if (setupStoreData) {
    window.localStorage.setItem('setup-store', setupStoreData)
  }
  if (versionData) {
    window.localStorage.setItem('appVersion', versionData)
  }
  window.location.href = '/'
}

const exportData = () => {
  // Create an export payload with the format of ImportEventPayload
  const exportPayload: ImportEventPayload = {
    events: eventsStore.customEvents,
    periods: eventsStore.periodTemplates,
  }

  // Convert to JSON
  const jsonData = JSON.stringify(exportPayload, null, 2)

  // Create a Blob with the JSON data
  const blob = new Blob([jsonData], { type: 'application/json' })

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob)

  // Create a temporary download link
  const a = document.createElement('a')
  a.href = url
  a.download = `life-visualizer-export-${new Date().toISOString().split('T')[0]}.json`

  // Append to the document, click to download, and then remove
  document.body.appendChild(a)
  a.click()

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
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
