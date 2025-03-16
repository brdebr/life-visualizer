import { festivities } from '#imports'

export type EventObject = {
  title?: string
  description?: string
  startDate?: string
  endDate?: string
  category?: string
  noWeekend?: boolean // Added noWeekend property
}

export type DateEventsObject = {
  dateId: string
  events?: EventObject[]
}

export type EventCategory = {
  title: string
  color: string
  visible?: boolean
  default?: boolean
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

    // Dynamic events
    const personalEvents: EventObject[] = eventsStore.buildDynamicEvents(wasBorn, yearsToLiveForCalc)

    // Custom events
    const customEventsMapped: EventObject[] = customEvents.value.map(event => ({
      startDate: event.startDate || '',
      endDate: event.endDate,
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'default',
      noWeekend: event.noWeekend || false,
    } satisfies EventObject))

    // Static events
    const staticDatasetMapped: EventObject[] = staticDataset.filter(item =>
      dayjs(item.date).isBetween(wasBorn, expectedEnd, 'day', '[)'),
    ).map((event) => {
      return {
        ...event,
        startDate: event.date,
        category: 'historical',
      } satisfies EventObject
    })

    // Festivities
    const festivityEvents: EventObject[] = festivities.map(event => ({
      startDate: event.startDate,
      title: event.title,
      category: 'vacation',
    } satisfies EventObject))

    const finalEvents: EventObject[] = []

    return finalEvents.concat(personalEvents, customEventsMapped, staticDatasetMapped, festivityEvents)
  })

  // The dynamic dataset is a record of events grouped by date
  const dynamicDataset = computed(() => {
    if (!isConfigured.value) {
      return {}
    }

    const finalRecord: Record<string, EventObject[]> = {}

    // Filter events that are not visible
    arrayDataset.value.forEach((el) => {
      // Check if event should be shown
      const startDateObj = dayjs(el.startDate!)
      const isWeekend = [0, 6].includes(startDateObj.day()) // 0 is Sunday, 6 is Saturday

      // Skip events with noWeekend flag on weekend days
      if (el.noWeekend && isWeekend) return

      // Skip events with categories that are not visible
      if (!el.category) {
        return
      }
      const category = eventCategories.value.find(cat => cat.title === el.category)
      if (category?.visible === false) return

      // Add the event to its start date
      const startDate = el.startDate!
      const events = finalRecord[startDate] || []
      events.push({
        ...el,
      })
      finalRecord[startDate] = events

      // Skip if no endDate or if it's the same as startDate
      if (!el.endDate || el.startDate === el.endDate) return

      // If event spans multiple days (has different end date), add it to all dates in between
      const start = dayjs(el.startDate)
      const end = dayjs(el.endDate)
      let current = start.add(1, 'day')

      // Add event to each day in the span until reaching the end date
      while (current.isSameOrBefore(end, 'day')) {
        const currentDateStr = current.format('YYYY-MM-DD')

        // For multi-day events, check weekend filtering for each day
        const currentIsWeekend = [0, 6].includes(current.day())
        if (el.noWeekend && currentIsWeekend) {
          current = current.add(1, 'day')
          continue
        }

        const dateEvents = finalRecord[currentDateStr] || []
        dateEvents.push({
          ...el,
        })
        finalRecord[currentDateStr] = dateEvents
        current = current.add(1, 'day')
      }
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
    const allEvents = dynamicDataset.value?.[date] || []

    if (!allEvents.length) {
      return buildDefaultDayContent(dateId)
    }

    return {
      dateId,
      events: allEvents,
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
