<template>
  <div class="border border-slate-600 rounded-md max-w-[420px] min-w-[300px] mx-auto my-3 px-3 pt-1 pb-2">
    <h3 class="px-2 pt-1 pb-1 mb-2 border-b text-sm flex">
      <span>
        {{ debouncedEvent?.dateId || '' }}
      </span>
      <span class="ml-auto pl-1">
        {{ fromNow }}
      </span>
    </h3>
    <div class="flex flex-col gap-2">
      <div
        v-for="event in debouncedEvent?.events || []"
        :key="event.title"
        class="flex flex-col gap-1"
      >
        <h4 class="font-semibold text-sm">
          {{ event?.title ? '· '+ event.title : 'No events this day' }} {{ event.endDate ? `- lasts for ${$dayjs(event.startDate).to($dayjs(event.endDate), true)}` : '' }}
        </h4>
        <p
          v-if="event.endDate"
          class="px-2 pb-2 text-xs"
        >
          {{ event.endDate ? `Start: ${$dayjs(event.startDate).fromNow()} - End: ${$dayjs(event.endDate).fromNow()}` : '' }}
        </p>
        <p class="px-2 pb-2 text-xs">
          {{ event?.description || '' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const appStore = useAppStore()
const { selectedEvent } = storeToRefs(appStore)
const debouncedEvent = ref(selectedEvent.value)
watch(selectedEvent, (newVal) => {
  if (newVal) {
    debouncedEvent.value = newVal
  }
})
const fromNow = computed(() => selectedEvent.value?.dateId ? appStore.dayjs(selectedEvent.value.dateId).fromNow() : '')
</script>
