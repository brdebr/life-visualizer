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
            {{ year }} is at {{ appStore.percentOfCurrentYear }}
          </div>
        </template>
      </HeatmapCalendar>
    </div>
    <div class="prose text-sm text-center">
      See your whole life visualized as a this calendar of boxes. <br> Marked with historical and personal events.
    </div>
    <div>
      <UButton
        color="primary"
        class="mb-3"
        @click="$router.push('/setup')"
      >
        <template #default>
          Start here
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
