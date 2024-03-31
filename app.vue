<template>
  <div class="mx-auto min-h-[100dvh] pb-10">
    <LayoutHeader />
    <NuxtPage />
    <LayoutTooltip />
  </div>
</template>
<script setup lang="ts">
const faviconEmoji = '⌛';
useHead({
  titleTemplate: (title) => title ? `Life Visualizer - ${title}` : 'Life Visualizer',
  meta: [
    { name: 'description', content: 'Little project to visualize your whole life like a Github contributions heatmap' }
  ],
  link: [
    { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2296%22>'+faviconEmoji+'</text></svg>' }
  ],
})
useSeoMeta({
  ogTitle: 'Life Visualizer',
  ogDescription: 'Little project to visualize your whole life like a Github contributions heatmap',
  ogImage: (process.env.URL || '') + '/thumbnail.jpg',
})
</script>
<style lang="scss">
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
