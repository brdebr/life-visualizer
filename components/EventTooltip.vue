<template>
  <div class="border border-slate-600 rounded-md max-w-[430px] min-w-[300px] mx-auto my-3 px-3 pt-1 pb-2">
    <h3 class="px-2 pt-1 pb-1 mb-2 border-b text-sm flex">
      <span>
        {{ debouncedEvent?.dateId }}
      </span>
      <span class="ml-auto pl-1">
        {{ fromNow }}
      </span>
    </h3>
    <div class="flex flex-col gap-2">
      <div
        v-for="event in visibleEvents"
        :key="event.title"
        class="flex flex-col gap-0.5"
      >
        <h4 class="flex gap-2 font-semibold text-sm">
          <span>
            · {{ event?.title }}
          </span>
          <span
            v-if="event.endDate"
            class="ml-auto"
          >
            {{ `Day ${$dayjs(debouncedEvent?.dateId).diff($dayjs(event.startDate), 'day')} of ${$dayjs(event.endDate).diff($dayjs(event.startDate), 'day')}` }}
          </span>
        </h4>
        <p
          v-if="event.endDate"
          class="px-2 -mt-1 pb-1 text-[10px]"
        >
          {{ `Start: ${$dayjs(event.startDate).format('DD/MM/YYYY')} - End: ${$dayjs(event.endDate).format('DD/MM/YYYY')}` }}
        </p>
        <p class="px-2 pb-2 text-xs">
          {{ event?.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const appStore = useAppStore()
const eventsStore = useEventsStore()
const { selectedEvent } = storeToRefs(appStore)
const debouncedEvent = ref(selectedEvent.value)
watch(selectedEvent, (newVal) => {
  if (newVal) {
    debouncedEvent.value = newVal
  }
})

const noEventsData = [{
  title: 'No events for this day.',
  description: '',
}] as EventObject[]

const visibleEvents = computed(() => {
  if (!debouncedEvent.value?.events) return noEventsData

  const filteredEvents = debouncedEvent.value.events.filter((event) => {
    if (!event.category) return true
    const category = eventsStore.eventCategories.find(cat => cat.title === event.category)
    return category?.visible !== false
  })

  if (filteredEvents.length === 0) return noEventsData

  return filteredEvents
})

const fromNow = computed(() => debouncedEvent.value?.dateId ? appStore.dayjs(debouncedEvent.value.dateId).fromNow() : '')
</script>
