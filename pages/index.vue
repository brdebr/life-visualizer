<template>
  <Heading />
  <div class="flex flex-col items-center gap-4 mt-5">
    <div class="">
      <Heatmap
        v-bind="{
          startDate: startOfYear,
          endDate: endOfYear,
          header: `${year} is at ${appStore.percentOfCurrentYear}`
        }"
      />
    </div>
    <div class="prose">
      See your whole life visualized as a calendar
    </div>
    <div>
      <UButton
        @click="$router.push('/setup')"
        color="primary"
        class="mb-3"
      >
        Start here
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
