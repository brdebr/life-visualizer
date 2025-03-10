<template>
  <div class="flex flex-col items-center gap-4">
    <div class="">
      <HeatmapCalendar
        v-bind="{
          startDate: startOfYear,
          endDate: endOfYear,
          zoomLevel: 1.5,
        }"
      >
        <template #header>
          <div class="text-center text-slate-600 dark:text-slate-400 mb-2">
            <div class="app-text">
              {{ year }} is at {{ appStore.percentOfCurrentYear }}
            </div>
            <div class="mt-2 mb-5 w-full">
              <UMeter
                color="water"
                class="w-full"
                :value="appStore.percentOfLife"
              >
                <template #label>
                  <div class="text-sm flex items-baseline justify-between -mt-1.5">
                    <span class="text-water-700 dark:text-water-200 mr-3">
                      Percent of the year
                    </span>
                    <span class="prose app-text text-[11px]">
                      {{ $dayjs().dayOfYear() }} days / {{ $dayjs().endOf('year').dayOfYear() }} days
                    </span>
                  </div>
                </template>
              </UMeter>
            </div>
          </div>
        </template>
      </HeatmapCalendar>
    </div>
    <div class="prose app-text text-sm text-center">
      See your whole life visualized as a this calendar of boxes. <br> Marked with historical and personal events.
    </div>
    <div>
      <UButton
        color="primary"
        class="mb-3"
        @click="$router.push('/setup')"
      >
        <template #default>
          <div class="tracking-wider">
            Start here
          </div>
        </template>
        <template #trailing>
          <UIcon
            name="fluent:cursor-click-24-filled"
            dynamic
            class="ml-1 -mr-1 size-5"
          />
        </template>
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const appStore = useAppStore()

const today = appStore.dayjs().format('YYYY-MM-DD')
const year = today.slice(0, 4)
const startOfYear = `${year}-01-01`
const endOfYear = `${year}-12-31`
</script>
