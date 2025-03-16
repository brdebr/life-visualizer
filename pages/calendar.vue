<template>
  <div>
    <div class="my-3">
      <HeatmapCalendar
        class="mx-auto"
        v-bind="{
          year: currentYear,
          zoomLevel: 1.5,
          selectEvent: appStore.selectEmptyEvent,
          getDayContent: appStore.getEmptyDayContent,
        }"
      >
        <template #header>
          <div class="prose app-text text-sm mb-1 mx-auto">
            {{ currentYear }} is at {{ appStore.percentOfCurrentYearString }}
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
          year: yearItem.year,
          zoomLevel: 1.2,
          selectEvent: appStore.selectEvent,
          getDayContent: appStore.getDayContent,
        }"
      >
        <template #header>
          <span
            :class="{
              'text-water-700': $dayjs().year() === $dayjs(yearItem.startDate).year(),
            }"
          >
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

const currentYear = appStore.dayjs().year()
</script>
