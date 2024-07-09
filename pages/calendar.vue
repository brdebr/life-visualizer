<template>
  <div>
    <div class="my-3">
      <HeatmapCalendar
        v-bind="{
          startDate: startOfYear,
          endDate: endOfYear,
          zoomLevel: 1.5,
        }"
      >
        <template #header>
          <div class="prose app-text text-sm mb-1 mx-auto">
            {{ year }} is at {{ appStore.percentOfCurrentYear }}
          </div>
        </template>
      </HeatmapCalendar>
    </div>
    <div
      v-if="appStore.isConfigured"
      class="container mx-auto my-7 px-5 pb-6"
    >
      <UMeter
        color="teal"
        :value="appStore.percentOfLife"
        indicator
      >
        <template #label>
          <div class="text-sm flex items-baseline gap-8">
            <span class="text-teal-500 dark:text-teal-400 lg:mr-3 mr-auto">
              Percent of your life
            </span>
            <span class="prose app-text text-[11px]">
              {{ appStore.age }} years / {{ appStore.yearsToLiveForCalc }} years
            </span>
            <span class="prose app-text text-[11px]">
              {{ appStore.amountOfDaysLivedStr[0].toLocaleString('en') }} days / {{ appStore.amountOfDaysLivedStr[1].toLocaleString('en') }} days
            </span>
          </div>
        </template>
      </UMeter>
    </div>
    <div
      v-if="appStore.isConfigured"
      class="flex flex-wrap justify-center gap-2 max-w-[100vw]"
    >
      <HeatmapCalendar
        v-for="yearItem in appStore.arrayOfLifeYears"
        :key="yearItem.startDate"
        v-bind="{
          startDate: yearItem.startDate,
          endDate: yearItem.endDate,
          dataset: appStore.dynamicDataset,
          header: yearItem.header,
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Calendar',
})
const appStore = useAppStore()
const router = useRouter()

if (!appStore.isConfigured) {
  router.push('/setup')
}

const today = appStore.dayjs().format('YYYY-MM-DD')
const year = today.slice(0, 4)
const startOfYear = `${year}-01-01`
const endOfYear = `${year}-12-31`
</script>
