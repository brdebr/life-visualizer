<template>
  <Heading />
  <div class="my-3">
    <Heatmap
      v-bind="{
        startDate: startOfYear,
        endDate: endOfYear,
        header: `${year} is at ${appStore.percentOfCurrentYear}`
      }"
    />
  </div>
  <div class="flex flex-wrap justify-center gap-2 max-w-[100vw]" v-if="appStore.isConfigured">
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
</template>
<script setup lang="ts">
useHead({
  title: 'Calendar'
})
const appStore = useAppStore();
const router = useRouter();

if (!appStore.isConfigured) {
  router.push('/setup');
}

const today = appStore.dayjs().format('YYYY-MM-DD');
const year = today.slice(0, 4);
const startOfYear = `${year}-01-01`;
const endOfYear = `${year}-12-31`;
</script>
