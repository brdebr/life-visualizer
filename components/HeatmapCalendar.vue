<template>
  <div class="flex flex-col justify-center items-center">
    <h3
      class="w-full text-center"
      :style="{
        fontSize: `${props.zoomLevel * 10}px`,
      }"
    >
      <slot name="header">
        {{ header }}
      </slot>
    </h3>
    <div
      ref="containerRef"
      class="calendar-heatmap-container"
    >
      <canvas
        ref="canvasRef"
        class="calendar-heatmap"
        :class="{
          'current-year': isCurrentYear,
        }"
        :width="computedSizes.width"
        :height="computedSizes.height"
        @click="handleCanvasClick"
        @mousemove="handleCanvasMove"
        @mouseleave="handleCanvasLeave"
      />
    </div>
    <slot name="footer" />
  </div>
</template>

<script lang="ts" setup>
export type HeatmapProps = {
  startDate: string
  endDate: string
  header?: string
  width?: number
  height?: number
  zoomLevel?: number
  showEvents?: boolean
}

const props = withDefaults(defineProps<HeatmapProps>(), {
  width: 420,
  height: 57,
  zoomLevel: 1,
  showEvents: true,
})

const appStore = useAppStore()
const { eventCategoriesWithPriority } = storeToRefs(appStore)
const searchStore = useSearchStore()
const { highlightedDates } = storeToRefs(searchStore)

const isCurrentYear = computed(() => {
  return appStore.dayjs(props.startDate).year() === appStore.dayjs().year()
})

const weekendDays = [0, 6]

const cellSize = 5
const cellMargin = 1

const spaceLeft = 22
const spaceTop = 6

const space = 1

// Canvas refs
const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const hoveredDayId = ref<string | null>(null)

const { isDark } = useIsDarkRef()

// Initialize canvas context after mount
onMounted(() => {
  if (canvasRef.value) {
    ctx.value = canvasRef.value.getContext('2d')
    draw()
  }
})

// Watch for changes that require redrawing
watch(() => [props.startDate, props.endDate, props.zoomLevel, highlightedDates.value, hoveredDayId.value, isDark.value], () => {
  nextTick(() => {
    draw()
  })
})

const computedSizes = computed(() => {
  return {
    width: props.width * props.zoomLevel,
    height: props.height * props.zoomLevel,
  }
})

const weekdayLegend = [
  { label: 'Mon', x: -3, dy: -5.5, dx: 0 },
  { label: 'Wed', x: -3, dy: 12, dx: 0 },
  { label: 'Fri', x: -3, dy: 12, dx: 0 },
  { label: 'Sun', x: -3, dy: 12.5, dx: 0 },
]

// Array of each week in a period, starting on firstDayOfWeek
const weeks = computed(() => {
  const year = appStore.dayjs(props.startDate).year()
  const startDateComputed = appStore.dayjs(props.startDate).startOf('day')

  const end = appStore.dayjs(props.endDate).endOf('day')
  const maxEnd = startDateComputed.add(11, 'month').endOf('month')
  const endDateComputed = end.isBefore(maxEnd) ? end : maxEnd
  const weeksCount = endDateComputed.diff(startDateComputed, 'week') + 1

  return Array.from({ length: weeksCount }, (_, weekIndex) => {
    const startOfWeek = startDateComputed.clone().add(weekIndex, 'week').startOf('isoWeek')
    const endOfWeek = startOfWeek.endOf('isoWeek')

    const days = Array.from({ length: 7 }, (__, dayIndex) => {
      const day = startOfWeek.clone().add(dayIndex, 'day').startOf('day')
      const dayId = day.format('YYYY-MM-DD')
      const event = appStore.getDayContent(dayId)
      const isInThePast = day.isBefore(appStore.dayjs())
      return {
        num: dayIndex,
        dayId,
        weekDay: day.day(),
        isInThePast,
        event,
        color: getDayColor(event, isInThePast),
        x: day.month() * (cellSize + cellMargin + space),
      }
    })

    return {
      startDate: startOfWeek,
      index: weekIndex,
      translateX: weekIndex * (cellSize + cellMargin),
      isFirstWeekOfMonth: days.some(day => day.weekDay === 1),
      label: `${startOfWeek.format('DD/MM/YYYY')} - ${endOfWeek.format('DD/MM/YYYY')}`,
      days: days.filter(day => day.dayId.slice(0, 4) === year.toString()),
    }
  })
})

const monthsLabels = computed(() => {
  const startDateComputed = appStore.dayjs(props.startDate).startOf('day')
  const end = appStore.dayjs(props.endDate).endOf('day')
  const maxEnd = startDateComputed.add(11, 'month').endOf('month')
  const endDateComputed = end.isBefore(maxEnd) ? end : maxEnd
  const months = endDateComputed.diff(startDateComputed, 'month') + 1

  return Array.from({ length: months }, (_, i) => {
    const month = startDateComputed.clone().add(i, 'month')
    const labelMonth = month.format('MMM')
    const labelYear = month.format('YY')
    const label = `${labelMonth} ${labelYear}`
    const translateX = (weeks.value.find(week => week.startDate.isSame(month, 'month'))?.translateX || 0) + (i * (cellSize + cellMargin + space))

    return {
      index: i,
      labelMonth,
      labelYear,
      label,
      translateX,
    }
  })
})

const dayColorMap = computed(() => isDark.value ? defaultHeatmapDarkColorsMap : defaultHeatmapLightColorsMap)
const debouncedColorMap = useDebounce(dayColorMap, 350)

// Add this new computed property
const categoryPriorityMap = computed(() => {
  return Object.fromEntries(
    eventCategoriesWithPriority.value.map(cat => [cat.title, { priority: cat.priority, color: cat.color }]),
  )
})

const getDayColor = (event: DateEventsObject | null, isInThePast: boolean): string => {
  if (!event?.events?.length || event.events[0].title === 'No events for this day.' || props.showEvents === false) {
    return isInThePast ? debouncedColorMap.value.PAST : debouncedColorMap.value.NO_DATA
  }

  // Find the event with highest priority category using the priority map
  const topEvent = event.events.reduce((highest, current) => {
    const currentCat = current.category && categoryPriorityMap.value[current.category]
    const highestCat = highest.category && categoryPriorityMap.value[highest.category]

    const currentPriority = currentCat ? currentCat.priority : 0
    const highestPriority = highestCat ? highestCat.priority : 0

    return currentPriority > highestPriority ? current : highest
  }, event.events[0])

  // Return color based on the event category
  // if (topEvent.type === 'personal' && !topEvent.category) {
  //   return debouncedColorMap.value.PERSONAL
  // }

  if (event.events.some(event => event.type === 'historical')) {
    return appStore.getCategoryByName('historical').color
  }

  // If there's a specific category, use its color
  if (topEvent.category) {
    // Get color directly from the map if available, otherwise fallback to getCategoryByName
    return categoryPriorityMap.value[topEvent.category]?.color
      || appStore.getCategoryByName(topEvent.category).color
  }

  // Fallback to historical events check
  // if (event.events.every(event => !!event.description)) {
  //   return appStore.getCategoryByName('historical').color
  // }

  // Default past/future coloring
  return isInThePast ? debouncedColorMap.value.PAST : debouncedColorMap.value.NO_DATA
}

// Canvas drawing functions
const draw = () => {
  if (!ctx.value || !canvasRef.value) return

  const canvas = canvasRef.value
  ctx.value.clearRect(0, 0, canvas.width, canvas.height)

  // Apply scaling for zoom level if not using viewBox
  if (props.zoomLevel !== 1) {
    ctx.value.save()
    ctx.value.scale(props.zoomLevel, props.zoomLevel)
  }

  // Draw border
  // ctx.value.strokeStyle = isCurrentYear.value ? '#74b5ff' : '#ddd'
  // ctx.value.strokeRect(0, 0, props.width, props.height)

  drawMonthLabels()
  drawDayLabels()
  drawDayCells()

  if (props.zoomLevel !== 1) {
    ctx.value.restore()
  }
}

const drawMonthLabels = () => {
  if (!ctx.value) return

  ctx.value.font = '8px sans-serif'
  ctx.value.textAlign = 'left'

  monthsLabels.value.forEach((month) => {
    if (!ctx.value) return
    const isCurrentMonth = isCurrentYear.value && month.index === appStore.dayjs().month()
    ctx.value.fillStyle = isCurrentMonth ? '#4a7ab1' : '#000'
    ctx.value!.fillText(month.labelMonth, spaceLeft + month.translateX, spaceTop + 2)
  })
}

const drawDayLabels = () => {
  if (!ctx.value) return

  ctx.value.font = '8px sans-serif'
  ctx.value.fillStyle = isDark.value ? '#fff' : '#000'
  ctx.value.textAlign = 'right'

  let y = spaceTop + 15
  weekdayLegend.forEach((day) => {
    ctx.value!.fillText(day.label, spaceLeft - 1 + day.x, y + day.dy)
    y += day.dy
  })
}

const drawDayCells = () => {
  if (!ctx.value) return

  const today = appStore.dayjs().format('YYYY-MM-DD')

  weeks.value.forEach((week) => {
    week.days.forEach((day) => {
      const x = spaceLeft + week.translateX + day.x
      const y = spaceTop + 5 + day.num * (cellSize + cellMargin) + (weekendDays.includes(day.weekDay) ? 1 : 0)

      // Fill rectangle
      ctx.value!.fillStyle = highlightedDates.value.includes(day.dayId) ? '#ff4242' : day.color
      ctx.value!.fillRect(x, y, cellSize, cellSize)

      // Stroke for highlighted or today
      if (highlightedDates.value.includes(day.dayId)) {
        ctx.value!.strokeStyle = '#ff4242'
        ctx.value!.lineWidth = 2
        ctx.value!.strokeRect(x, y, cellSize, cellSize)
      }
      else if (day.dayId === today) {
        ctx.value!.strokeStyle = isDark.value ? '#3b82f6' : '#0ea5e9' // blue-500 or water-500
        ctx.value!.lineWidth = 1
        ctx.value!.strokeRect(x, y, cellSize, cellSize)
      }

      // Hover effect
      if (day.dayId === hoveredDayId.value) {
        ctx.value!.strokeStyle = '#000'
        ctx.value!.lineWidth = 1
        ctx.value!.strokeRect(x, y, cellSize, cellSize)
      }
    })
  })
}

// Hit detection for mouse events
const getDayFromPosition = (x: number, y: number): { dayId: string } | null => {
  const scale = props.zoomLevel
  x = x / scale
  y = y / scale

  for (const week of weeks.value) {
    const weekX = spaceLeft + week.translateX

    for (const day of week.days) {
      const cellX = weekX + day.x
      const cellY = spaceTop + 5 + day.num * (cellSize + cellMargin) + (weekendDays.includes(day.weekDay) ? 1 : 0)

      if (
        x >= cellX
        && x <= cellX + cellSize
        && y >= cellY
        && y <= cellY + cellSize
      ) {
        return { dayId: day.dayId }
      }
    }
  }

  return null
}

// Event handlers
const handleCanvasClick = (event: MouseEvent) => {
  if (!canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const day = getDayFromPosition(x, y)
  if (day) {
    appStore.selectEvent(day.dayId)
  }
}

const handleCanvasMove = (event: MouseEvent) => {
  if (!canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const day = getDayFromPosition(x, y)
  if (day) {
    hoveredDayId.value = day.dayId
    appStore.selectEvent(day.dayId)
  }
  else {
    hoveredDayId.value = null
  }
}

const handleCanvasLeave = () => {
  hoveredDayId.value = null
  appStore.selectEvent('')
}
</script>

<style lang="scss">
.calendar-heatmap {
  @apply border overflow-hidden;
  &.current-year {
    // @apply border-[#74b5ff];
    // @apply border-[#4a7ab1];
    @apply border-water-500;
  }
}

.calendar-heatmap-container {
  position: relative;
}
</style>
