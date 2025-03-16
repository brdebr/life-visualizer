import type dayjs from '#build/dayjs.imports.mjs'

export const useEventsStore = defineStore('events-store', () => {
  const eventCategories = useLocalStorage<EventCategory[]>('eventCategories', [
    { title: 'historical', color: '#8b75e1', visible: true },
    { title: 'personal', color: '#c6e6e4', visible: true },
    { title: 'vacation', color: '#a6f2bf', visible: true },
    { title: 'work', color: '#e3ddc0', visible: false },
    { title: 'school', color: '#d0e4fb', visible: true },
    { title: 'default', color: '#e5e7eb', visible: true },
  ])

  const categoryColorMap = computed(() => {
    return eventCategories.value.reduce((acc, category) => {
      acc[category.title] = category.color
      return acc
    }, {} as Record<string, string>)
  })

  const eventCategoriesWithPriority = computed(() => {
    return eventCategories.value.map((category, index) => ({
      ...category,
      priority: eventCategories.value.length - index,
    })) satisfies EventCategoryWithPriority[]
  })

  const visibleCategories = computed(() => {
    return eventCategories.value.filter(cat => cat.visible !== false)
  })

  const addCategory = (category: EventCategory) => {
    eventCategories.value.push({
      ...category,
      visible: true,
    })
  }

  const updateCategory = (index: number, category: EventCategory) => {
    eventCategories.value[index] = category
  }

  const deleteCategory = (index: number) => {
    // Don't allow deleting the default category
    if (eventCategories.value[index].title === 'default') return
    eventCategories.value.splice(index, 1)
  }

  const updateCategoriesOrder = (newOrder: EventCategory[]) => {
    eventCategories.value = newOrder
  }

  const toggleCategoryVisibility = (index: number) => {
    eventCategories.value[index] = {
      ...eventCategories.value[index],
      visible: !eventCategories.value[index].visible,
    }
  }

  const getCategoryByName = (categoryName?: string) => {
    if (!categoryName) return eventCategories.value.find(cat => cat.title === 'default')!

    return eventCategories.value.find(cat => cat.title.toLowerCase() === categoryName.toLowerCase())
      || eventCategories.value.find(cat => cat.title === 'default')!
  }

  const customEvents = useLocalStorage<EventObject[]>('customEvents', [])

  const addCustomEvent = (event: EventObject) => {
    customEvents.value.push(event)
  }

  const updateCustomEvent = (index: number, event: EventObject) => {
    customEvents.value[index] = event
  }

  const deleteCustomEvent = (index: number) => {
    customEvents.value.splice(index, 1)
  }

  const buildDynamicEvents = (wasBornDate: dayjs.Dayjs, yearsToLiveForCalc: Ref<number>) => {
    const events: EventObject[] = []

    // Guardería (1-3 años)
    events.push({
      startDate: wasBornDate.clone().add(1, 'year').month(8).day(1).format('YYYY-MM-DD'),
      endDate: wasBornDate.clone().add(3, 'year').month(5).day(30).format('YYYY-MM-DD'),
      title: 'Guardería',
      description: 'Periodo de guardería infantil.',
      category: 'school',
    })

    // Educación Infantil (3-5 años)
    for (let i = 3; i <= 5; i++) {
      events.push({
        startDate: wasBornDate.clone().add(i, 'year').month(8).day(10).format('YYYY-MM-DD'),
        endDate: wasBornDate.clone().add(i + 1, 'year').month(5).day(20).format('YYYY-MM-DD'),
        title: `${i - 2}º Infantil`,
        description: `Curso ${i - 2}º de Educación Infantil.`,
        category: 'school',
      })
    }

    // Educación Primaria (6-11 años)
    for (let i = 6; i <= 11; i++) {
      events.push({
        startDate: wasBornDate.clone().add(i, 'year').month(8).day(10).format('YYYY-MM-DD'),
        endDate: wasBornDate.clone().add(i + 1, 'year').month(5).day(20).format('YYYY-MM-DD'),
        title: `${i - 5}º Primaria`,
        description: `Curso ${i - 5}º de Educación Primaria.`,
        category: 'school',
      })
    }

    // ESO (12-15 años)
    for (let i = 12; i <= 15; i++) {
      events.push({
        startDate: wasBornDate.clone().add(i, 'year').month(8).day(15).format('YYYY-MM-DD'),
        endDate: wasBornDate.clone().add(i + 1, 'year').month(5).day(25).format('YYYY-MM-DD'),
        title: `${i - 11}º ESO`,
        description: `Curso ${i - 11}º de Educación Secundaria Obligatoria (ESO).`,
        category: 'school',
      })
    }

    // Bachillerato (16-17 años)
    for (let i = 16; i <= 17; i++) {
      events.push({
        startDate: wasBornDate.clone().add(i, 'year').month(8).day(15).format('YYYY-MM-DD'),
        endDate: wasBornDate.clone().add(i + 1, 'year').month(5).day(25).format('YYYY-MM-DD'),
        title: `${i - 15}º Bachillerato`,
        description: `Curso ${i - 15}º de Bachillerato.`,
        category: 'school',
      })
    }

    // Universidad (18-21 años)
    for (let i = 18; i <= 21; i++) {
      events.push({
        startDate: wasBornDate.clone().add(i, 'year').month(8).day(15).format('YYYY-MM-DD'),
        endDate: wasBornDate.clone().add(i + 1, 'year').month(5).day(25).format('YYYY-MM-DD'),
        title: `Curso ${i - 17}º Universidad`,
        description: `Curso ${i - 17}º de la universidad.`,
        category: 'school',
      })
    }

    // Majority Age, Career, and Retirement
    const legalAgeDate = wasBornDate.clone().add(18, 'year').format('YYYY-MM-DD')
    const startWorkDate = wasBornDate.clone().add(22, 'year').month(8).day(1).format('YYYY-MM-DD')
    const startRetirementDate = wasBornDate.clone().add(65, 'year').format('YYYY-MM-DD')

    events.push(
      { startDate: legalAgeDate, title: 'Mayoría de Edad', description: 'Has alcanzado la mayoría de edad.', category: 'personal' },
      {
        startDate: startWorkDate,
        endDate: startRetirementDate,
        title: 'Carrera Profesional',
        description: 'Periodo de vida laboral activa.',
        category: 'work',
      },
      {
        startDate: startRetirementDate,
        title: 'Jubilación',
        description: 'Comienzo del periodo de jubilación.',
        category: 'personal',
      },
    )

    const birthdays: EventObject[] = Array.from({ length: yearsToLiveForCalc.value + 1 }, (_, i) => ({
      startDate: wasBornDate.clone().add(i, 'year').format('YYYY-MM-DD'),
      title: i === 0 ? 'Nacimiento' : `${i}º Cumpleaños`,
      description: i === 0 ? 'Fecha de nacimiento.' : `Has cumplido ${i} años.`,
      category: 'personal',
    }))

    const personalEvents = birthdays.concat(events)

    return personalEvents
  }

  return {
    // Category state
    eventCategories,
    eventCategoriesWithPriority,
    visibleCategories,

    // Category operations
    addCategory,
    updateCategory,
    deleteCategory,
    updateCategoriesOrder,
    toggleCategoryVisibility,
    getCategoryByName,
    categoryColorMap,

    // Custom events state and operations
    customEvents,
    addCustomEvent,
    updateCustomEvent,
    deleteCustomEvent,

    buildDynamicEvents,
  }
})
