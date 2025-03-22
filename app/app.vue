<template>
  <div class="life-visualizer-app mx-auto min-h-[100dvh] pb-10">
    <LayoutHeader />
    <NuxtPage />
    <LayoutTooltip />
  </div>
</template>

<script setup lang="ts">
const faviconEmoji = '⌛'

const appTitle = 'Life Visualizer'
const appDescription = 'Little project to visualize your whole life like a Github contributions heatmap'
useHead({
  titleTemplate: pageTitle => pageTitle ? `${appTitle} - ${pageTitle}` : appTitle,
  meta: [
    { name: 'description', content: appDescription },
  ],
  link: [
    { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2296%22>' + faviconEmoji + '</text></svg>' },
  ],
  htmlAttrs: {
    lang: 'en',
  },
})

useSeoMeta({
  ogTitle: appTitle,
  ogDescription: appDescription,
  ogUrl: 'https://life-visualizer.netlify.app/',
  twitterTitle: appTitle,
  twitterDescription: appDescription,
  twitterImage: (process.env.URL || '') + '/thumbnail.jpg',
  twitterCard: 'summary',
  ogImage: (process.env.URL || '') + '/thumbnail.jpg',
})

const dayjs = useDayjs()

const configs = useRuntimeConfig()
const appVersion = configs.public.gitHash
const appVersionDate = configs.public.gitCommitDate
const daysSinceLastCommit = dayjs().diff(dayjs(appVersionDate), 'day')
const appVersionSaved = useLocalStorage('appVersion', configs.public.gitHash)

// Alert the user if the app version has changed
// And then save the new version and clear the local storage
if (appVersionSaved.value !== appVersion) {
  alert(`The app has been updated to the version ${appVersion} - you have ${appVersionSaved.value}.\nYour local storage will be cleared.\nThe new version was deployed ${daysSinceLastCommit} days ago.`)
  const setupStoreData = window.localStorage.getItem('setup-store')
  window.localStorage.clear()
  if (setupStoreData) {
    window.localStorage.setItem('setup-store', setupStoreData)
  }
  appVersionSaved.value = appVersion
  window.location.href = '/'
}
</script>

<style lang="scss">
// App colors
.app-text {
  @apply text-cool-700 dark:text-cool-50;
}

// Tippy box
.tippy-box {
  @apply bg-white dark:bg-slate-950;
}
.tippy-content {
  @apply p-0;
  @apply text-slate-900 dark:text-white;
}
.tippy-arrow {
 @apply text-slate-600;
}
</style>
