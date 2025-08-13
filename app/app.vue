<template>
  <div class="life-visualizer-app">
    <UApp>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </div>
</template>

<script setup lang="ts">
const { appDescription, faviconLink, titleTemplate, seoMeta } = useAppSeoConfig()

useHead({
  titleTemplate,
  meta: [
    { name: 'description', content: appDescription },
  ],
  link: [
    faviconLink,
  ],
  htmlAttrs: {
    lang: 'en',
  },
})

useSeoMeta({
  ...seoMeta,
  twitterCard: 'summary',
})
</script>

<style>
@reference "~/assets/styles/global.css";

.life-visualizer-app {
  @apply
    mx-auto
    min-h-[100dvh]
    pb-10
  ;
}
</style>
