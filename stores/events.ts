import type dayjs from '#build/dayjs.imports.mjs'

export const useEventsStore = defineStore('events-store', () => {
  const eventCategories = useLocalStorage<EventCategory[]>('eventCategories', [
    { title: 'historical', color: '#8b75e1', visible: true },
    { title: 'personal', color: '#c6e6e4', visible: true },
    { title: 'vacation', color: '#a6f2bf', visible: true },
    { title: 'yearly', color: '#feffd6', visible: true },
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
      noWeekend: true,
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
      noWeekend: true,
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
      noWeekend: true,
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
      noWeekend: true,
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
      noWeekend: true,
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
      noWeekend: true,
      ageStart: 18,
      ageEnd: 21,
      dateStart: { month: 8, day: 15 },
      dateEnd: { month: 5, day: 25 },
      generateYearly: true,
      yearlyTitleFormat: 'Universidad: Curso %num',
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
      noWeekend: true,
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
      category: 'yearly',
      ageStart: 0,
      ageEnd: -1,
      dateStart: { month: 0, day: 0 }, // Actual birth date
      generateYearly: true,
      yearlyTitleFormat: '%numº Cumpleaños',
      yearlyDescriptionFormat: 'Has cumplido %num años.',
    },
    {
      id: 'vacations-summer-kid',
      title: 'Vacaciones',
      description: 'Vacaciones de verano',
      category: 'vacation',
      ageStart: 4,
      ageEnd: 11,
      dateStart: {
        month: 5,
        day: 21,
      },
      dateEnd: {
        month: 8,
        day: 9,
      },
      generateYearly: true,
      yearlyTitleFormat: 'Verano del %year',
    },
    {
      id: 'vacations-summer-teen',
      title: 'Vacaciones',
      description: 'Vacaciones de verano',
      category: 'vacation',
      ageStart: 12,
      ageEnd: 18,
      dateStart: {
        month: 5,
        day: 26,
      },
      dateEnd: {
        month: 8,
        day: 14,
      },
      generateYearly: true,
      yearlyTitleFormat: 'Verano del %year',
    },
    {
      id: 'christmas',
      title: 'Navidad',
      description: 'Celebración de la Navidad',
      category: 'yearly',
      ageStart: 0,
      ageEnd: -1,
      dateStart: { month: 11, day: 25 }, // December 25th (months are 0-indexed)
      generateYearly: true,
      yearlyTitleFormat: 'Navidad %year',
    },
    {
      id: 'halloween',
      title: 'Halloween',
      description: 'Noche de Halloween',
      category: 'yearly',
      ageStart: 0,
      ageEnd: -1,
      dateStart: { month: 9, day: 31 }, // October 31st
      generateYearly: true,
      yearlyTitleFormat: 'Halloween %year',
    },
    {
      id: 'valentines',
      title: 'San Valentín',
      description: 'Día de los enamorados',
      category: 'yearly',
      ageStart: 0,
      ageEnd: -1,
      dateStart: { month: 1, day: 14 }, // February 14th
      generateYearly: true,
      yearlyTitleFormat: 'San Valentín %year',
    },
    {
      id: 'treekings',
      title: 'Día de Reyes',
      description: 'Celebración del día de los Reyes Magos',
      category: 'yearly',
      ageStart: 0,
      ageEnd: -1,
      dateStart: { month: 0, day: 6 }, // January 6th
      generateYearly: true,
      yearlyTitleFormat: 'Día de Reyes %year',
    },
  ])

  const addPeriodTemplate = (template: PeriodTemplate) => {
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
    const buildEventTitle = (template: PeriodTemplate, key: 'yearlyTitleFormat' | 'yearlyDescriptionFormat', vars: { yearIndex?: number, yearNum?: number }, fallback: string) => {
      if (!template.generateYearly || !template[key]) return fallback
      return template[key].replace('%num', vars.yearIndex?.toString() || '').replace('%year', vars.yearNum?.toString() || '')
    }

    periodTemplates.value.forEach((template) => {
      // Skip disabled templates
      if (template.disabled) return

      if (template.id === 'birthdays') {
        for (let i = 0; i <= yearsToLiveForCalc.value; i++) {
          const eventTitle = buildEventTitle(template, 'yearlyTitleFormat', { yearIndex: i + 1 }, template.title)
          const eventDescription = buildEventTitle(template, 'yearlyDescriptionFormat', { yearIndex: i + 1 }, template.description)

          events.push({
            startDate: wasBornDate.clone().add(i, 'year').format('YYYY-MM-DD'),
            title: eventTitle,
            description: eventDescription,
            category: template.category,
            noWeekend: template.noWeekend,
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
          noWeekend: template.noWeekend,
        })
        return
      }
      // Events with endAge = -1 are considered to last until the end of life
      const endAgeForCalc = endAge === -1 ? yearsToLiveForCalc.value : endAge

      // For period events with yearly generation
      if (template.generateYearly) {
        for (let i = startAge; i <= endAgeForCalc; i++) {
          const yearIndex = template.yearStartOffset ? i - template.yearStartOffset : i - startAge + 1

          const startDate = wasBornDate.clone()
            .add(i, 'year')
            .month(template.dateStart.month)
            .date(template.dateStart.day)
            .format('YYYY-MM-DD')

          // check if the dateEnd is smaller than dateStart (month and day)
          const lastsMoreThanAYear = template.dateEnd && (template.dateEnd.month < template.dateStart.month || (template.dateEnd.month === template.dateStart.month && template.dateEnd.day < template.dateStart.day))
          const yearEnd = lastsMoreThanAYear ? i + 1 : i
          const yearNum = wasBornDate.clone().add(i, 'year').year()

          const endDate = wasBornDate.clone()
            .add(yearEnd, 'year')
            .month(template.dateEnd?.month || template.dateStart.month)
            .date(template.dateEnd?.day || template.dateStart.day)
            .format('YYYY-MM-DD')

          const eventTitle = buildEventTitle(template, 'yearlyTitleFormat', { yearIndex, yearNum }, template.title)
          const eventDescription = buildEventTitle(template, 'yearlyDescriptionFormat', { yearIndex, yearNum }, template.description)

          events.push({
            startDate,
            endDate,
            title: eventTitle,
            description: eventDescription,
            category: template.category,
            noWeekend: template.noWeekend,
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
        noWeekend: template.noWeekend,
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
export type PeriodTemplate = {
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
  noWeekend?: boolean // Added noWeekend property
  yearlyDescriptionFormat?: string
  yearStartOffset?: number
  disabled?: boolean
}
