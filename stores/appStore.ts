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
    // const wasBornDate = wasBorn.format('YYYY-MM-DD')

    const events = []

    // Guardería (1-3 años)
    events.push({
      date: wasBorn.clone().add(1, 'year').month(8).day(1).format('YYYY-MM-DD'),
      endDate: wasBorn.clone().add(3, 'year').month(5).day(30).format('YYYY-MM-DD'),
      title: 'Guardería',
      description: 'Periodo de guardería infantil.',
      type: 'personal',
      category: 'school',
    })

    // Educación Infantil (3-5 años)
    for (let i = 3; i <= 5; i++) {
      events.push({
        date: wasBorn.clone().add(i, 'year').month(8).day(10).format('YYYY-MM-DD'),
        endDate: wasBorn.clone().add(i + 1, 'year').month(5).day(20).format('YYYY-MM-DD'),
        title: `${i - 2}º Infantil`,
        description: `Curso ${i - 2}º de Educación Infantil.`,
        type: 'personal',
        category: 'school',
      })
    }

    // Educación Primaria (6-11 años)
    for (let i = 6; i <= 11; i++) {
      events.push({
        date: wasBorn.clone().add(i, 'year').month(8).day(10).format('YYYY-MM-DD'),
        endDate: wasBorn.clone().add(i + 1, 'year').month(5).day(20).format('YYYY-MM-DD'),
        title: `${i - 5}º Primaria`,
        description: `Curso ${i - 5}º de Educación Primaria.`,
        type: 'personal',
        category: 'school',
      })
    }

    // ESO (12-15 años)
    for (let i = 12; i <= 15; i++) {
      events.push({
        date: wasBorn.clone().add(i, 'year').month(8).day(15).format('YYYY-MM-DD'),
        endDate: wasBorn.clone().add(i + 1, 'year').month(5).day(25).format('YYYY-MM-DD'),
        title: `${i - 11}º ESO`,
        description: `Curso ${i - 11}º de Educación Secundaria Obligatoria (ESO).`,
        type: 'personal',
        category: 'school',
      })
    }

    // Bachillerato (16-17 años)
    for (let i = 16; i <= 17; i++) {
      events.push({
        date: wasBorn.clone().add(i, 'year').month(8).day(15).format('YYYY-MM-DD'),
        endDate: wasBorn.clone().add(i + 1, 'year').month(5).day(25).format('YYYY-MM-DD'),
        title: `${i - 15}º Bachillerato`,
        description: `Curso ${i - 15}º de Bachillerato.`,
        type: 'personal',
        category: 'school',
      })
    }

    // Universidad (18-21 años)
    for (let i = 18; i <= 21; i++) {
      events.push({
        date: wasBorn.clone().add(i, 'year').month(8).day(15).format('YYYY-MM-DD'),
        endDate: wasBorn.clone().add(i + 1, 'year').month(5).day(25).format('YYYY-MM-DD'),
        title: `Curso ${i - 17}º Universidad`,
        description: `Curso ${i - 17}º de la universidad.`,
        type: 'personal',
        category: 'school',
      })
    }

    // Majority Age, Career, and Retirement
    const legalAgeDate = wasBorn.clone().add(18, 'year').format('YYYY-MM-DD')
    const startWorkDate = wasBorn.clone().add(22, 'year').month(8).day(1).format('YYYY-MM-DD')
    const startRetirementDate = wasBorn.clone().add(65, 'year').format('YYYY-MM-DD')

    events.push(
      { date: legalAgeDate, title: 'Mayoría de Edad', description: 'Has alcanzado la mayoría de edad.', type: 'personal', category: 'personal' },
      {
        date: startWorkDate,
        endDate: startRetirementDate,
        title: 'Carrera Profesional',
        description: 'Periodo de vida laboral activa.',
        type: 'personal',
        category: 'work',
      },
      {
        date: startRetirementDate,
        title: 'Jubilación',
        description: 'Comienzo del periodo de jubilación.',
        type: 'personal',
        category: 'personal',
      },
    )

    const birthdays = Array.from({ length: yearsToLiveForCalc.value + 1 }, (_, i) => ({
      date: wasBorn.clone().add(i, 'year').format('YYYY-MM-DD'),
      title: i === 0 ? 'Nacimiento' : `${i}º Cumpleaños`,
      description: i === 0 ? 'Fecha de nacimiento.' : `Has cumplido ${i} años.`,
      type: 'personal',
      category: 'personal',
    }))

    const personalEvents = [...birthdays, ...events]

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
