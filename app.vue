<template>
  <div class="mx-auto min-h-[100dvh] pt-3 pb-10">
    <h1 class="text-slate-800 text-lg font-semibold tracking-wide mb-2 text-center">Life Visualizer</h1>
    <h2 class="text-slate-600 text-center">{{ appStore.percentOfLife }}</h2>
    <div class="my-3">
      <Heatmap
        v-bind="{
          startDate: startOfYear,
          endDate: endOfYear,
          dataset: appStore.dynamicDataset,
          header: `${year} is at ${appStore.percentOfCurrentYear}`
        }"
      />
    </div>
    <div>
      <input type="date" v-model="wasBornDate" />
      <input type="number" v-model="yearsToLive" />
      <button @click="appStore.calculate">Calculate</button>
    </div>
    <div class="flex flex-wrap justify-center gap-2 max-w-[100vw]">
      <Heatmap
        v-for="year in appStore.arrayOfLifeYears"
        :key="year.startDate"
          v-bind="{
            startDate: year.startDate,
            endDate: year.endDate,
            dataset: appStore.dynamicDataset,
            header: year.header,
          }"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
const faviconEmoji = '⌛';
useHead({
  title: 'Life Visualizer',
  meta: [
    { name: 'description', content: 'Little project to visualize your whole life like a github contributions heatmap' }
  ],
  link: [
    { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2296%22>'+faviconEmoji+'</text></svg>' }
  ]
})
const appStore = useAppStore();

const today = appStore.dayjs().format('YYYY-MM-DD');
const year = today.slice(0, 4);
const startOfYear = `${year}-01-01`;
const endOfYear = `${year}-12-31`;


const { wasBornDate, yearsToLive } = storeToRefs(appStore);
useTippyStore();

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
