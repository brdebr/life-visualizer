import { useLocalStorage } from '@vueuse/core'

export type EventObject = {
  title?: string
  description?: string
  startDate?: string
  endDate?: string
  category?: string
  type?: string
}

export type DateEventsObject = {
  dateId: string
  events?: EventObject[]
}

export type EventCategory = {
  title: string
  color: string
}

export const useAppStore = defineStore('app-store', () => {
  const dayjs = useDayjs()

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
    // return `${((currentDay / diff) * 100).toFixed(2)}%`
    return ((currentDay / diff) * 100)
  })
  const percentOfCurrentYearString = computed(() => {
    return `${percentOfCurrentYear.value.toFixed(2)}%`
  })

  const arrayOfLifeYears = computed(() => {
    return Array.from({ length: yearsToLiveForCalc.value + 1 }, (_, i) => {
      return {
        startDate: `${parseInt(wasBornForCalc.value) + i}-01-01`,
        endDate: `${parseInt(wasBornForCalc.value) + i}-12-31`,
        header: `${parseInt(wasBornForCalc.value.slice(0, 4), 10) + i} - [ ${i} years old ]`,
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

  // Define event categories using useLocalStorage - order determines priority (higher index = higher priority)
  const eventCategories = useLocalStorage<EventCategory[]>('eventCategories', [
    { title: 'historical', color: '#8b75e1' },
    { title: 'personal', color: '#c6e6e4' },
    { title: 'vacation', color: '#a6f2bf' },
    { title: 'work', color: '#e3ddc0' },
    { title: 'school', color: '#d0e4fb' },
    { title: 'default', color: '#e5e7eb' },
  ])

  const eventCategoriesWithPriority = computed(() => {
    return eventCategories.value.map((category, index) => ({
      ...category,
      priority: eventCategories.value.length - index,
    }))
  })

  // Add a new category
  const addCategory = (category: EventCategory) => {
    eventCategories.value.push(category)
  }

  // Update an existing category
  const updateCategory = (index: number, category: EventCategory) => {
    eventCategories.value[index] = category
  }

  // Delete a category
  const deleteCategory = (index: number) => {
    // Don't allow deleting the default category
    if (eventCategories.value[index].title === 'default') return
    eventCategories.value.splice(index, 1)
  }

  // Update categories after reordering - no need to set priorities
  const updateCategoriesOrder = (newOrder: EventCategory[]) => {
    eventCategories.value = newOrder
  }

  // Get category by name with fallback to default
  // Higher index in array = higher priority
  const getCategoryByName = (categoryName?: string) => {
    if (!categoryName) return eventCategories.value.find(cat => cat.title === 'default')!

    return eventCategories.value.find(cat => cat.title === categoryName.toLowerCase())
      || eventCategories.value.find(cat => cat.title === 'default')!
  }

  // Store for custom events using useLocalStorage
  const customEvents = useLocalStorage<EventObject[]>('customEvents', [])

  // Add a new custom event
  const addCustomEvent = (event: EventObject) => {
    customEvents.value.push(event)
  }

  // Delete a custom event
  const deleteCustomEvent = (index: number) => {
    customEvents.value.splice(index, 1)
  }

  const arrayDataset = computed(() => {
    if (!isConfigured.value) {
      return []
    }
    const wasBorn = dayjs(wasBornForCalc.value)
    const expectedEnd = wasBorn.clone().add(yearsToLiveForCalc.value, 'year')
    const wasBornDate = wasBorn.format('YYYY-MM-DD')
    const startSchoolDate = wasBorn.clone().add(5, 'year').month(9).day(15).format('YYYY-MM-DD')
    const endSchoolDate = wasBorn.clone().add(18, 'year').month(5).day(31).format('YYYY-MM-DD')
    const legalAgeDate = wasBorn.clone().add(18, 'year').format('YYYY-MM-DD')
    const startCollegeDate = wasBorn.clone().add(18, 'year').month(8).day(15).format('YYYY-MM-DD')
    const endCollegeDate = wasBorn.clone().add(22, 'year').month(5).day(15).format('YYYY-MM-DD')
    const startWorkDate = wasBorn.clone().add(22, 'year').add(6, 'month').format('YYYY-MM-DD')
    const startRetirementDate = wasBorn.clone().add(65, 'year').format('YYYY-MM-DD')

    const birthdays = Array.from({ length: yearsToLiveForCalc.value + 1 }, (_, i) => {
      if (i === 0) return { date: wasBornDate, title: 'Birth', description: 'You were born.', type: 'personal', category: 'personal' }
      if (i === 1) return { date: `${parseInt(wasBornForCalc.value.slice(0, 4), 10) + i}${wasBornDate.slice(4)}`, title: 'First Birthday', description: 'It\'s your first birthday.', type: 'personal', category: 'personal' }
      if (i === 100) return { date: `${parseInt(wasBornForCalc.value.slice(0, 4), 10) + i}${wasBornDate.slice(4)}`, title: 'Hundredth Birthday', description: 'You are a hundred years old!!', type: 'personal', category: 'personal' }
      return { date: `${parseInt(wasBornForCalc.value.slice(0, 4), 10) + i}${wasBornDate.slice(4)}`, title: 'Birthday', description: `It's your ${i} birthday !!`, type: 'personal', category: 'personal' }
    })

    const personalEvents = [
      ...birthdays,
      {
        date: startSchoolDate,
        endDate: endSchoolDate,
        title: 'School Education',
        description: 'K-12 education period.',
        type: 'personal',
        category: 'school',
      },
      { date: legalAgeDate, title: 'Legal Age', description: 'You reached the legal age.', type: 'personal', category: 'personal' },
      {
        date: startCollegeDate,
        endDate: endCollegeDate,
        title: 'College',
        description: 'College education period.',
        type: 'personal',
        category: 'school',
      },
      {
        date: startWorkDate,
        endDate: startRetirementDate,
        title: 'Career',
        description: 'Your working career.',
        type: 'personal',
        category: 'work',
      },
      { date: startRetirementDate, title: 'Start of Retirement', description: 'You started retirement.', type: 'personal', category: 'personal' },
    ]

    const finalDataset: {
      date: string
      endDate?: string
      title: string
      description: string
      type?: string
      category?: string
    }[] = [
      ...personalEvents,
      ...staticDataset.filter(item => dayjs(item.date).isBetween(wasBorn, expectedEnd, 'day', '[]')).map((event) => {
        return {
          ...event,
          type: 'historical',
        }
      }),
      ...customEvents.value.map(event => ({
        date: event.startDate || '',
        endDate: event.endDate,
        title: event.title || '',
        description: event.description || '',
        type: event.type || 'custom',
        category: event.category || 'historical',
      })),
    ]

    return finalDataset
  })

  const dynamicDataset = computed(() => {
    if (!isConfigured.value) {
      return {}
    }

    const finalRecord: Record<string, EventObject[]> = {}

    // Process each event - store only at their start date
    arrayDataset.value.forEach(({ title, description, date, endDate, type, category }) => {
      const events = finalRecord[date] || []
      events.push({
        title,
        description,
        type,
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
      return {
        dateId,
        events: [{ title: 'No events for this day.', description: '' }],
      }
    }

    return {
      dateId,
      events: allEvents,
    }
  }

  return {
    dayjs,
    wasBornDate,
    yearsToLive,
    percentOfCurrentYearString,
    percentOfCurrentYear,
    percentOfLife,
    wasBornForCalc,
    yearsToLiveForCalc,
    calculate,
    dynamicDataset,
    arrayOfLifeYears,
    getDayContent,
    eventCategoriesWithPriority,
    selectedEvent,
    selectEvent,
    isConfigured,
    amountOfDaysLivedStr,
    arrayDataset,
    age,
    eventCategories,
    getCategoryByName,
    addCategory,
    updateCategory,
    deleteCategory,
    updateCategoriesOrder,
    customEvents,
    addCustomEvent,
    deleteCustomEvent,
  }
})
