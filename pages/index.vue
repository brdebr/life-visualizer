<template>
  <Heading />
  <div class="flex flex-col items-center gap-4 mt-5">
    <div class="">
      <Heatmap
        v-bind="{
          startDate: startOfYear,
          endDate: endOfYear,
          zoomLevel: 1.5,
          header: `${year} is at ${appStore.percentOfCurrentYear}`
        }"
      />
    </div>
    <div class="prose text-sm text-center">
      See your whole life visualized as a this boxed calendar. <br> Marked with historical and personal events.
    </div>
    <div>
      <UButton
        @click="$router.push('/setup')"
        color="primary"
        class="mb-3"
      >
        <template #default>
          Start here
        </template>
        <template #trailing>
          <UIcon name="fluent:cursor-click-24-filled" dynamic class="ml-1 -mr-1 size-5" />
        </template>
      </UButton>
    </div>
  </div>
</template>
<script setup lang="ts">
const appStore = useAppStore();

const today = appStore.dayjs().format('YYYY-MM-DD');
const year = today.slice(0, 4);
const startOfYear = `${year}-01-01`;
const endOfYear = `${year}-12-31`;
</script>