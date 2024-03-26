<template>
  <div class="mx-auto min-h-[100dvh] pt-3 pb-10">
    <h1 class="text-slate-800 text-lg font-semibold tracking-wide mb-2 text-center">Life Visualizer</h1>
    <h2 class="text-slate-600 text-center">You are at: {{ appStore.percentOfLife }} of your life</h2>
    <div class="my-3">
      <Heatmap
        v-bind="{
          startDate: $dayjs().startOf('year'),
          endDate: $dayjs().endOf('year'),
          dataset: appStore.dynamicDataset,
          width,
          height,
          header: ` - currently at ${appStore.percentOfCurrentYear}`
        }"
      />
    </div>
    <div>
      <input type="date" v-model="wasBornDate" />
      <input type="number" v-model="yearsToLive" />
      <input type="number" v-model="width" />
      <input type="number" v-model="height" />
    </div>
    <div class="border rounded-md min-h-[180px] max-h-[180px] overflow-hidden container max-w-[420px] mx-auto my-3 px-3 pt-1 pb-2 grid grid-rows-[auto_1fr]">
      <template v-if="!selectedEvent">
        <h3 class="text-lg font-semibold text-slate-800">No selected event</h3>
        <div class="flex items-center justify-center text-slate-600 h-28">Hover a day to see the details here</div>
      </template>
      <template v-else>
        <h3 class="px-2 pt-1 mb-2 border-b text-sm">{{selectedEvent.eventDate}}</h3>
        <h4 class="font-semibold text-sm">· {{selectedEvent.title || 'No events this day'}}</h4>
        <p v-if="selectedEvent.description" class="p-2 h-28 text-sm">{{selectedEvent.description}}</p>
      </template>
    </div>
    <div class="flex flex-wrap justify-center gap-2 max-w-[100vw]">
      <Heatmap
        v-for="year in appStore.arrayOfLifeYears"
        :key="year.startDate.year()"
          v-bind="{
            startDate: year.startDate,
            endDate: year.endDate,
            dataset: appStore.dynamicDataset,
            header: year.header,
          }"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
const faviconEmoji = '⌛';
useHead({
  title: 'Life Visualizer',
  meta: [
    { name: 'description', content: 'Little project to visualize your whole life like a github contributions heatmap' }
  ],
  link: [
    { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2296%22>'+faviconEmoji+'</text></svg>' }
  ]
})

const width = ref(420);
const height = ref(56);

const appStore = useAppStore();
const { wasBornDate, yearsToLive, selectedEvent } = storeToRefs(appStore);
</script>
