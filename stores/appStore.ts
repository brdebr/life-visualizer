export type EventObject = {
  title?: string
  description?: string
  startDate?: string
  endDate?: string
  category?: string
}

export type DateEventsObject = {
  dateId: string
  events?: EventObject[]
}

export type EventCategory = {
  title: string
  color: string
  visible?: boolean
}

export type EventCategoryWithPriority = EventCategory & {
  priority: number
}

export const useAppStore = defineStore('app-store', () => {
  const dayjs = useDayjs()
  const eventsStore = useEventsStore()
  const { eventCategories, customEvents } = storeToRefs(eventsStore)

  const wasBornDate = ref('1970-01-01')
  const yearsToLive = ref(105)

  const wasBornForCalc = ref(wasBornDate.value)
  const yearsToLiveForCalc = ref(yearsToLive.value)
  const age = computed(() => dayjs().diff(wasBornForCalc.value, 'year'))

  const isConfigured = ref(false)

  const calculate = () => {
    wasBornForCalc.value = wasBornDate.value
    yearsToLiveForCalc.value = yearsToLive.value
    isConfigured.value = true
  }

  const percentOfCurrentYear = computed(() => {
    const currentDate = dayjs()
    const startDate = currentDate.startOf('year')
    const endDate = currentDate.endOf('year')
    const diff = endDate.diff(startDate, 'day')
    const currentDay = currentDate.dayOfYear()
    return ((currentDay / diff) * 100)
  })
  const percentOfCurrentYearString = computed(() => {
    return `${percentOfCurrentYear.value.toFixed(2)}%`
  })

  const arrayOfLifeYears = computed(() => {
    return Array.from({ length: yearsToLiveForCalc.value + 1 }, (_, i) => {
      const parsedYear = parseInt(wasBornForCalc.value) + i
      return {
        year: parsedYear,
        startDate: `${parsedYear}-01-01`,
        endDate: `${parsedYear}-12-31`,
        header: `${parsedYear} - [ ${i} years old ]`,
      }
    })
  })

  const percentOfLife = computed(() => {
    const startDate = dayjs(wasBornForCalc.value)
    const endDate = startDate.clone().add(yearsToLiveForCalc.value, 'year')
    const diff = endDate.diff(startDate, 'day')
    const currentDay = dayjs().diff(startDate, 'day')
    const percent = ((currentDay / diff) * 100)
    if (percent > 100) {
      return 100
    }

    return percent
  })

  const amountOfDaysLivedStr = computed(() => {
    const start = dayjs(wasBornForCalc.value)
    const end = dayjs()

    const daysLived = end.diff(start, 'days')
    const expectedDaysToLive = start.clone().add(yearsToLiveForCalc.value, 'years').diff(start, 'days')

    return [
      daysLived,
      expectedDaysToLive,
    ]
  })

  const arrayDataset = computed(() => {
    if (!isConfigured.value) {
      return []
    }
    const wasBorn = dayjs(wasBornForCalc.value)
    const expectedEnd = wasBorn.clone().add(yearsToLiveForCalc.value, 'year')

    const personalEvents: EventObject[] = eventsStore.buildDynamicEvents(wasBorn, yearsToLiveForCalc)

    const customEventsMapped: EventObject[] = customEvents.value.map(event => ({
      date: event.startDate || '',
      endDate: event.endDate,
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'default',
    }))

    const staticDatasetMapped: EventObject[] = staticDataset.filter(item =>
      dayjs(item.date).isBetween(wasBorn, expectedEnd, 'day', '[)'),
    ).map((event) => {
      return {
        ...event,
        category: 'historical',
      }
    })

    const finalEvents: EventObject[] = []

    return finalEvents.concat(personalEvents, customEventsMapped, staticDatasetMapped)
  })

  const dynamicDataset = computed(() => {
    if (!isConfigured.value) {
      return {}
    }

    const finalRecord: Record<string, EventObject[]> = {}

    // Process each event - store only at their start date
    arrayDataset.value.forEach(({ title, description, date, endDate, category }) => {
      const events = finalRecord[date] || []
      events.push({
        title,
        description,
        startDate: date,
        endDate,
        category,
      })
      finalRecord[date] = events
    })

    return finalRecord
  })

  const selectedEvent = ref<DateEventsObject | null>(null)
  const selectEvent = useDebounceFn((date: string) => {
    if (!date) {
      selectedEvent.value = null
      return
    }
    selectedEvent.value = getDayContent(date)
  }, 250)

  const selectEmptyEvent = useDebounceFn((date: string) => {
    if (!date) {
      selectedEvent.value = null
      return
    }
    selectedEvent.value = getEmptyDayContent(date)
  }, 250)

  const buildDefaultDayContent = (dateId: string): DateEventsObject => {
    return {
      dateId,
      events: [],
    }
  }

  const getDayContent = (date: string): DateEventsObject => {
    const dateObj = dayjs(date)
    const dateId = dateObj.format('dddd - YYYY-MM-DD')

    // Get events starting on this specific day
    const directEvents = dynamicDataset.value?.[date] || []

    // Find multi-day events that span this day
    const spanningEvents: EventObject[] = []

    // Look through all events to find spanning ones
    Object.values(dynamicDataset.value || {}).forEach((events) => {
      events.forEach((event) => {
        // Skip if no endDate or it's a single-day event
        if (!event.endDate || event.startDate === event.endDate) return

        // Skip events that already start on this day (they're in directEvents)
        if (event.startDate === date) return

        const eventStart = dayjs(event.startDate)
        const eventEnd = dayjs(event.endDate)

        // Check if this date falls within the event's range
        if ((dateObj.isAfter(eventStart) && dateObj.isBefore(eventEnd)) || dateObj.isSame(eventEnd)) {
          spanningEvents.push(event)
        }
      })
    })

    // Combine direct and spanning events
    const allEvents = [...directEvents, ...spanningEvents]

    if (!allEvents.length) {
      return buildDefaultDayContent(dateId)
    }

    // Filter out events from hidden categories
    const visibleEvents = allEvents.filter((event) => {
      // If no category or category doesn't exist in our list, show it
      if (!event.category) return true

      const category = eventCategories.value.find(cat => cat.title === event.category)
      return category?.visible !== false
    })

    // If all events are filtered out
    if (!visibleEvents.length) {
      return buildDefaultDayContent(dateId)
    }

    return {
      dateId,
      events: visibleEvents,
    }
  }

  const getEmptyDayContent = (date: string): DateEventsObject => {
    const dateId = dayjs(date).format('dddd - YYYY-MM-DD')
    return buildDefaultDayContent(dateId)
  }

  return {
    // Core date utilities
    dayjs,

    // Basic configuration
    wasBornDate,
    yearsToLive,
    wasBornForCalc,
    yearsToLiveForCalc,
    isConfigured,
    calculate,

    // Age and time calculations
    age,
    percentOfCurrentYear,
    percentOfCurrentYearString,
    percentOfLife,
    amountOfDaysLivedStr,

    // Year and timeline data
    arrayOfLifeYears,

    // Events data and operations
    dynamicDataset,
    arrayDataset,
    getDayContent,
    getEmptyDayContent,
    selectEmptyEvent,
    selectedEvent,
    selectEvent,
  }
})
