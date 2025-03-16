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

  // Period templates for dynamic events
  const periodTemplates = useLocalStorage<PeriodTemplate[]>('periodTemplates', [
    {
      id: 'preschool',
      title: 'Guardería',
      description: 'Periodo de guardería infantil.',
      category: 'school',
      ageStart: 1,
      ageEnd: 3,
      dateStart: { month: 8, day: 1 },
      dateEnd: { month: 5, day: 30 },
    },
    {
      id: 'kindergarten',
      title: 'Educación Infantil',
      description: 'Periodo de educación infantil.',
      category: 'school',
      ageStart: 3,
      ageEnd: 5,
      dateStart: { month: 8, day: 10 },
      dateEnd: { month: 5, day: 20 },
      generateYearly: true,
      yearlyTitleFormat: '%numº Infantil',
    },
    {
      id: 'primary',
      title: 'Educación Primaria',
      description: 'Periodo de educación primaria.',
      category: 'school',
      ageStart: 6,
      ageEnd: 11,
      dateStart: { month: 8, day: 10 },
      dateEnd: { month: 5, day: 20 },
      generateYearly: true,
      yearlyTitleFormat: '%numº Primaria',
    },
    {
      id: 'secondary',
      title: 'ESO',
      description: 'Educación Secundaria Obligatoria.',
      category: 'school',
      ageStart: 12,
      ageEnd: 15,
      dateStart: { month: 8, day: 15 },
      dateEnd: { month: 5, day: 25 },
      generateYearly: true,
      yearlyTitleFormat: '%numº ESO',
    },
    {
      id: 'highschool',
      title: 'Bachillerato',
      description: 'Periodo de bachillerato.',
      category: 'school',
      ageStart: 16,
      ageEnd: 17,
      dateStart: { month: 8, day: 15 },
      dateEnd: { month: 5, day: 25 },
      generateYearly: true,
      yearlyTitleFormat: '%numº Bachillerato',
    },
    {
      id: 'university',
      title: 'Universidad',
      description: 'Periodo universitario.',
      category: 'school',
      ageStart: 18,
      ageEnd: 21,
      dateStart: { month: 8, day: 15 },
      dateEnd: { month: 5, day: 25 },
      generateYearly: true,
      yearlyTitleFormat: 'Curso %numº Universidad',
    },
    {
      id: 'majority',
      title: 'Mayoría de Edad',
      description: 'Has alcanzado la mayoría de edad.',
      category: 'personal',
      ageStart: 18,
      dateStart: { month: 0, day: 0 }, // Actual birth date
    },
    {
      id: 'career',
      title: 'Carrera Profesional',
      description: 'Periodo de vida laboral activa.',
      category: 'work',
      ageStart: 22,
      ageEnd: 65,
      dateStart: { month: 8, day: 1 },
    },
    {
      id: 'retirement',
      title: 'Jubilación',
      description: 'Comienzo del periodo de jubilación.',
      category: 'personal',
      ageStart: 65,
      dateStart: { month: 0, day: 0 }, // Actual birth date
    },
    {
      id: 'birthdays',
      title: 'Cumpleaños',
      description: 'Celebración de cumpleaños cada año.',
      category: 'personal',
      ageStart: 0,
      dateStart: { month: 0, day: 0 }, // Actual birth date
      generateYearly: true,
      yearlyTitleFormat: '%numº Cumpleaños',
      yearlyDescriptionFormat: 'Has cumplido %num años.',
    },
  ])

  const addPeriodTemplate = (template: PeriodTemplate) => {
    // Generate a unique ID if none provided
    if (!template.id) {
      template.id = `template-${crypto.randomUUID()}`
    }
    periodTemplates.value.push(template)
  }

  const updatePeriodTemplate = (id: string, template: PeriodTemplate) => {
    const index = periodTemplates.value.findIndex(t => t.id === id)
    if (index !== -1) {
      periodTemplates.value[index] = { ...template, id }
    }
  }

  const deletePeriodTemplate = (id: string) => {
    const index = periodTemplates.value.findIndex(t => t.id === id)
    if (index !== -1) {
      periodTemplates.value.splice(index, 1)
    }
  }

  const buildDynamicEvents = (wasBornDate: dayjs.Dayjs, yearsToLiveForCalc: Ref<number>) => {
    const events: EventObject[] = []

    periodTemplates.value.forEach((template) => {
      // Special case for birthdays to have events for all years
      if (template.id === 'birthdays') {
        for (let i = 0; i <= yearsToLiveForCalc.value; i++) {
          const eventTitle = template.generateYearly && template.yearlyTitleFormat
            ? eval('`' + template.yearlyTitleFormat + '`')
            : template.title

          const eventDescription = template.generateYearly && template.yearlyDescriptionFormat
            ? eval('`' + template.yearlyDescriptionFormat + '`')
            : template.description

          events.push({
            startDate: wasBornDate.clone().add(i, 'year').format('YYYY-MM-DD'),
            title: eventTitle,
            description: eventDescription,
            category: template.category,
          })
        }
        return
      }

      // For other templates
      const startAge = template.ageStart
      const endAge = template.ageEnd

      // For single day events
      if (!endAge) {
        let startDate
        if (template.dateStart.month === 0 && template.dateStart.day === 0) {
          // Use exact birthday
          startDate = wasBornDate.clone().add(startAge, 'year').format('YYYY-MM-DD')
        }
        else {
          // Use specific month and day
          startDate = wasBornDate.clone()
            .add(startAge, 'year')
            .month(template.dateStart.month)
            .date(template.dateStart.day)
            .format('YYYY-MM-DD')
        }

        events.push({
          startDate,
          title: template.title,
          description: template.description,
          category: template.category,
        })
        return
      }

      // For period events with yearly generation
      if (template.generateYearly) {
        for (let i = startAge; i <= endAge; i++) {
          const yearNumber = template.yearStartOffset ? i - template.yearStartOffset : i - startAge + 1

          const eventTitle = template.yearlyTitleFormat
            ? eval('`' + template.yearlyTitleFormat.replace('${yearNumber}', yearNumber) + '`')
            : `${template.title} ${yearNumber}`

          const eventDescription = template.yearlyDescriptionFormat
            ? eval('`' + template.yearlyDescriptionFormat.replace('${yearNumber}', yearNumber) + '`')
            : template.description

          const startDate = wasBornDate.clone()
            .add(i, 'year')
            .month(template.dateStart.month)
            .date(template.dateStart.day)
            .format('YYYY-MM-DD')

          const endDate = wasBornDate.clone()
            .add(i + 1, 'year')
            .month(template.dateEnd?.month || template.dateStart.month)
            .date(template.dateEnd?.day || template.dateStart.day)
            .format('YYYY-MM-DD')

          events.push({
            startDate,
            endDate,
            title: eventTitle,
            description: eventDescription,
            category: template.category,
          })
        }
        return
      }

      // For regular period events
      const startDate = wasBornDate.clone()
        .add(startAge, 'year')
        .month(template.dateStart.month)
        .date(template.dateStart.day)
        .format('YYYY-MM-DD')

      const endDate = endAge
        ? wasBornDate.clone()
            .add(endAge, 'year')
            .month(template.dateEnd?.month || template.dateStart.month)
            .date(template.dateEnd?.day || template.dateStart.day)
            .format('YYYY-MM-DD')
        : undefined

      events.push({
        startDate,
        endDate,
        title: template.title,
        description: template.description,
        category: template.category,
      })
    })

    return events
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

    // Period templates state and operations
    periodTemplates,
    addPeriodTemplate,
    updatePeriodTemplate,
    deletePeriodTemplate,

    buildDynamicEvents,
  }
})

// Add new type for period templates
interface PeriodTemplate {
  id: string
  title: string
  description: string
  category: string
  ageStart: number
  ageEnd?: number
  dateStart: { month: number, day: number }
  dateEnd?: { month: number, day: number }
  generateYearly?: boolean
  yearlyTitleFormat?: string
  yearlyDescriptionFormat?: string
  yearStartOffset?: number
}
