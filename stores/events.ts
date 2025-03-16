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
  }
})
