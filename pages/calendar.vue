<template>
  <div class="my-3">
    <Heatmap
      v-bind="{
        startDate: startOfYear,
        endDate: endOfYear,
        zoomLevel: 1.5,
      }"
    >
      <template #header>
        <div class="prose text-sm mb-1">
          {{ year }} is at {{ appStore.percentOfCurrentYear }}
        </div>
      </template>
    </Heatmap>
  </div>
  <div class="container mx-auto my-7 px-5 pb-6" v-if="appStore.isConfigured">
    <UMeter color="teal" :value="appStore.percentOfLife" indicator>
      <template #label>
        <div class="text-sm flex items-baseline gap-8">
          <span class="text-teal-500 dark:text-teal-400 mr-3">
            Percent of your life
          </span>
          <span class="prose text-[11px]">
            {{ appStore.age }} years / {{ appStore.yearsToLiveForCalc }} years
          </span>
          <span class="prose text-[11px]">
            {{ appStore.amountOfDaysLivedStr[0].toLocaleString('en') }} days / {{appStore.amountOfDaysLivedStr[1].toLocaleString('en') }} days
          </span>
        </div>
      </template>
    </UMeter>
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
