import type dayjs from '#build/dayjs.imports.mjs'
import { customEventsData } from '~/data/customEventsData'

export const useEventsStore = defineStore('events-store', () => {
  const eventCategories = useLocalStorage<EventCategory[]>('eventCategories', [
    { title: 'historical', color: '#8b75e1', visible: true },
    { title: 'vacation', color: '#6cc188', visible: true },
    { title: 'work', color: '#e3ddc0', visible: true },
    { title: 'personal', color: '#8ee1db', visible: true },
    { title: 'yearly', color: '#aacb62', visible: true },
    { title: 'school', color: '#9ab6d5', visible: true },
    { title: 'default', color: '#e5e7eb', visible: true, default: true },
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
    if (eventCategories.value[index]?.default) return
    eventCategories.value.splice(index, 1)
  }

  const updateCategoriesOrder = (newOrder: EventCategory[]) => {
    eventCategories.value = newOrder
  }

  const toggleCategoryVisibility = (index: number) => {
    if (!eventCategories.value?.[index]) return
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

  const customEvents = useLocalStorage<EventObject[]>('customEvents', customEventsData)

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
  const periodTemplates = useLocalStorage<PeriodTemplate[]>('periodTemplates', customPeriodsData)

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
