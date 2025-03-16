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
      <UButton
        color="primary"
        size="sm"
        variant="outline"
        @click="clearLocalStorage"
      >
        Clean local storage
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
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

const clearLocalStorage = () => {
  // preserve only what is in the key 'setup-store'
  const setupStoreData = window.localStorage.getItem('setup-store')
  window.localStorage.clear()
  if (setupStoreData) {
    window.localStorage.setItem('setup-store', setupStoreData)
  }
  // navigate to /
  window.location.href = '/'
}
</script>
