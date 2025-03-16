<template>
  <div class="border border-slate-600 rounded-md max-w-[430px] min-w-[300px] mx-auto my-3 px-4 pt-1 pb-2">
    <h3 class="px-2 pt-1 pb-1 mb-2 border-b text-sm flex">
      <span>
        {{ selectedEvent?.dateId || '' }}
      </span>
      <span class="ml-auto pl-1">
        {{ fromNow }}
      </span>
    </h3>
    <div
      v-if="visibleEvents.length"
      class="flex flex-col gap-2"
    >
      <div
        v-for="event in visibleEvents"
        :key="event.title"
        class="flex flex-col gap-0.5"
      >
        <h4
          class="flex gap-2 font-semibold text-sm border-b border-b-[--category-color] mx-2"
          :style="`--category-color: ${eventsStore.categoryColorMap[event.category || 'default']}`"
        >
          <div class="flex gap-1 items-center">
            <span
              class="size-2 rounded-none bg-[--category-color] inline-block absolute -ml-[14px]"
            >
              &nbsp;
            </span>
            <span class="">
              {{ event.title }}
            </span>
          </div>
          <span
            v-if="event.endDate"
            class="ml-auto"
          >
            {{ daysCount(event) }}
          </span>
        </h4>
        <p
          v-if="event.endDate"
          class="px-2 pb-1 text-[10px]"
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
const dayjs = useDayjs()
const appStore = useAppStore()
const eventsStore = useEventsStore()
const { selectedEvent } = storeToRefs(appStore)
const debouncedEvent = ref(selectedEvent.value)
watch(selectedEvent, (newVal) => {
  if (newVal) {
    debouncedEvent.value = newVal
  }
})

const daysCount = (event: EventObject) => {
  if (event.noWeekend) {
    return `Day ${dayjs(selectedEvent.value?.dateId).businessDiff(dayjs(event.startDate))} of ${dayjs(event.endDate).businessDiff(dayjs(event.startDate))}`
  }
  return `Day ${dayjs(selectedEvent.value?.dateId).diff(dayjs(event.startDate), 'day')} of ${dayjs(event.endDate).diff(dayjs(event.startDate), 'day')}`
}

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
