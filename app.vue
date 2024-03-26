<template>
  <div class="mx-auto min-h-[100dvh] pt-3 pb-10">
    <Tooltip />
    <NuxtPage />
  </div>
</template>
<script setup lang="ts">
const faviconEmoji = '⌛';
useHead({
  meta: [
    { name: 'description', content: 'Little project to visualize your whole life like a github contributions heatmap' }
  ],
  link: [
    { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2296%22>'+faviconEmoji+'</text></svg>' }
  ]
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
</style>
