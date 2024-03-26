<template>
  <h1 class="text-slate-800 text-xl font-semibold tracking-wide mb-2 text-center">Life Visualizer</h1>
  <div class="my-3">
    <Heatmap
      v-bind="{
        startDate: startOfYear,
        endDate: endOfYear,
        header: `${year} is at ${appStore.percentOfCurrentYear}`
      }"
    />
  </div>
</template>
<script setup lang="ts">
const appStore = useAppStore();

const today = appStore.dayjs().format('YYYY-MM-DD');
const year = today.slice(0, 4);
const startOfYear = `${year}-01-01`;
const endOfYear = `${year}-12-31`;
</script>
