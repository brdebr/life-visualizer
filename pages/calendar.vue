<template>
  <div>
    <div class="my-3">
      <HeatmapCalendar
        class="mx-auto"
        v-bind="{
          startDate: startOfYear,
          endDate: endOfYear,
          zoomLevel: 1.5,
          showEvents: false,
        }"
      >
        <template #header>
          <div class="prose app-text text-sm mb-1 mx-auto">
            {{ year }} is at {{ appStore.percentOfCurrentYearString }}
          </div>
        </template>
        <template #header-append>
          <span class="prose app-text text-[11px]">
            {{ $dayjs().dayOfYear() }} days / {{ $dayjs().endOf('year').dayOfYear() }} days
          </span>
        </template>
      </HeatmapCalendar>
    </div>
    <div
      v-if="appStore.isConfigured"
      class="container mx-auto my-7 px-5 pb-6"
    >
      <UMeter
        color="water"
        :value="appStore.percentOfLife"
        :ui="{
          indicator: {
            text: 'text-water-700 dark:text-water-200 -mb-1',
          },
        }"
        indicator
      >
        <template #label>
          <div class="text-sm flex items-baseline gap-8">
            <span class="text-water-700 dark:text-water-200 lg:mr-3 mr-auto">
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
          zoomLevel: 1.2,
        }"
      >
        <template #header>
          <span :class="{
            'text-water-700': $dayjs().year() === $dayjs(yearItem.startDate).year(),
          }">
            {{ yearItem.header }}
          </span>
        </template>
      </HeatmapCalendar>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Calendar',
})
const appStore = useAppStore()
const router = useRouter()
onBeforeMount(() => {
  if (!appStore.isConfigured) {
    router.push('/setup')
  }
})

const today = appStore.dayjs().format('YYYY-MM-DD')
const year = today.slice(0, 4)
const startOfYear = `${year}-01-01`
const endOfYear = `${year}-12-31`
</script>
