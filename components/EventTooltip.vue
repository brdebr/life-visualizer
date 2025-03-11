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
        v-for="event in visibleEvents"
        :key="event.title"
        class="flex flex-col gap-1"
      >
        <h4 class="font-semibold text-sm">
          {{ event?.title ? '· '+ event.title : 'No events this day' }} {{ event.endDate ? `- Day ${$dayjs(debouncedEvent?.dateId).diff($dayjs(event.startDate), 'day')} of ${$dayjs(event.endDate).diff($dayjs(event.startDate), 'day')}` : '' }}
        </h4>
        <p
          v-if="event.endDate"
          class="px-2 pb-2 text-[10px]"
        >
          {{ event.endDate ? `Start: ${$dayjs(event.startDate).format('DD/MM/YYYY')} - End: ${$dayjs(event.endDate).format('DD/MM/YYYY')}` : '' }}
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

const visibleEvents = computed(() => {
  if (!debouncedEvent.value?.events) return []

  // If the first event has this title, there are no events
  if (debouncedEvent.value.events[0]?.title === 'No events for this day.') {
    return debouncedEvent.value.events
  }

  // Filter events by visible categories
  return debouncedEvent.value.events.filter((event) => {
    if (!event.category) return true
    const category = appStore.eventCategories.find(cat => cat.title === event.category)
    return category?.visible !== false
  })
})

const fromNow = computed(() => selectedEvent.value?.dateId ? appStore.dayjs(selectedEvent.value.dateId).fromNow() : '')
</script>
