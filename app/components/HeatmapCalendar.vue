<template>
  <div class="w-fit flex flex-col justify-center items-center relative calendar-heatmap--root">
    <h3
      class="w-full text-center pb-0.5"
      :style="{
        fontSize: `${props.zoomLevel * 10}px`,
      }"
    >
      <slot name="header">
        {{ header }}
      </slot>
      <span class="absolute right-0 top-0">
        <slot name="header-append" />
      </span>
    </h3>
    <div
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
        @click="handleCanvasAction"
        @mousemove="handleCanvasAction"
        @mouseleave="handleCanvasLeave"
      />
    </div>
    <slot name="footer" />
  </div>
</template>

<script lang="ts" setup>
export type HeatmapProps = {
  year?: number
  header?: string
  width?: number
  height?: number
  zoomLevel?: number
  showEvents?: boolean
  categories?: EventCategoryWithPriority[]
  selectEvent: (dateId: string) => void
  getDayContent: (dateId: string) => DateEventsObject
}

const { isDark } = useIsDarkRef()
const dayjs = useDayjs()

const weekendDays = [0, 6]
const weekdayLegend = [
  { label: 'Mon', x: -2.5, dy: -5.5, dx: 0 },
  { label: 'Wed', x: -2.5, dy: 12, dx: 0 },
  { label: 'Fri', x: -2.5, dy: 12, dx: 0 },
  { label: 'Sun', x: -2.5, dy: 12.5, dx: 0 },
]

const {
  spacings,
  cellColors,
  monthsLabels: monthsLabelsConstants,
  weekdaysLabels,
} = MAGIC_VALUES

// PROPS
const props = withDefaults(defineProps<HeatmapProps>(), {
  width: 420,
  height: 57,
  zoomLevel: 1,
  showEvents: true,
  categories: () => [],
  year: new Date().getUTCFullYear(),
})
// DATE CONSTANTS
const startDate = computed(() => {
  return dayjs().year(props.year).startOf('year').format('YYYY-MM-DD')
})
const endDate = computed(() => {
  return dayjs().year(props.year).endOf('year').format('YYYY-MM-DD')
})
const isCurrentYear = computed(() => {
  return props.year === dayjs().year()
})

// STORES
const searchStore = useSearchStore()
const { highlightedDates } = storeToRefs(searchStore)

// CANVAS
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')
const ctx = ref<CanvasRenderingContext2D | null>(null)
const hoveredDayId = ref<string | null>(null)

onMounted(() => {
  if (!canvasRef.value) {
    return
  }
  const viewportWidth = window.innerWidth
  if (viewportWidth < 1110) {
    const canvas = canvasRef.value
    const dpr = window.devicePixelRatio || 1
    // Set style dimensions to computedSizes
    canvas.style.width = `${computedSizes.value.width}px`
    canvas.style.height = `${computedSizes.value.height}px`
    // Set canvas resolution based on devicePixelRatio
    canvas.width = computedSizes.value.width * dpr
    canvas.height = computedSizes.value.height * dpr
    ctx.value = canvas.getContext('2d')
    // Scale drawing context to counter the increased resolution
    ctx.value?.scale(dpr, dpr)
  }
  else {
    ctx.value = canvasRef.value.getContext('2d')
  }

  requestAnimationFrame(draw)
})

// Watch for changes that require redrawing
watch(() => [
  props.year,
  props.zoomLevel,
  highlightedDates.value,
  hoveredDayId.value,
  isDark.value,
], () => {
  requestAnimationFrame(draw)
})

const computedSizes = computed(() => {
  return {
    width: props.width * props.zoomLevel,
    height: props.height * props.zoomLevel,
  }
})

const weeks = computed(() => {
  const year = dayjs(startDate.value).year()
  const startDateComputed = dayjs(startDate.value).startOf('day')

  const end = dayjs(endDate.value).endOf('day')
  const maxEnd = startDateComputed.add(11, 'month').endOf('month')
  const endDateComputed = end.isBefore(maxEnd) ? end : maxEnd
  const weeksCount = endDateComputed.diff(startDateComputed, 'week') + 1

  return Array.from({ length: weeksCount }, (_, weekIndex) => {
    const startOfWeek = startDateComputed.clone().add(weekIndex, 'week').startOf('isoWeek')
    const endOfWeek = startOfWeek.endOf('isoWeek')

    const days = Array.from({ length: 7 }, (__, dayIndex) => {
      const day = startOfWeek.clone().add(dayIndex, 'day').startOf('day')
      const dayId = day.format('YYYY-MM-DD')
      const event = props.getDayContent(dayId)
      const isInThePast = day.isBefore(dayjs())
      return {
        num: dayIndex,
        dayId,
        weekDay: day.day(),
        isInThePast,
        event,
        color: getDayColor(event, isInThePast),
        x: day.month() * (spacings.cellSize + spacings.cellMargin + spacings.space),
      }
    })

    return {
      startDate: startOfWeek,
      index: weekIndex,
      translateX: weekIndex * (spacings.cellSize + spacings.cellMargin),
      isFirstWeekOfMonth: days.some(day => day.weekDay === 1),
      label: `${startOfWeek.format('DD/MM/YYYY')} - ${endOfWeek.format('DD/MM/YYYY')}`,
      days: days.filter(day => day.dayId.slice(0, 4) === year.toString()),
    }
  })
})

const monthsLabels = computed(() => {
  const startDateComputed = dayjs(startDate.value).startOf('day')
  const end = dayjs(endDate.value).endOf('day')
  const maxEnd = startDateComputed.add(11, 'month').endOf('month')
  const endDateComputed = end.isBefore(maxEnd) ? end : maxEnd
  const months = endDateComputed.diff(startDateComputed, 'month') + 1

  return Array.from({ length: months }, (_, i) => {
    const month = startDateComputed.clone().add(i, 'month')
    const labelMonth = month.format('MMM')
    const labelYear = month.format('YY')
    const label = `${labelMonth} ${labelYear}`
    const weekTranslateX = weeks.value.find(week => week.startDate.isSame(month, 'month'))?.translateX || 0
    const translateX = weekTranslateX + (i * (spacings.cellSize + spacings.cellMargin + spacings.space))

    return {
      index: i,
      labelMonth,
      labelYear,
      label,
      translateX,
    }
  })
})

const categoryPriorityMap = computed(() => {
  return Object.fromEntries(
    props.categories.map(cat => [cat.title, {
      priority: cat.priority,
      color: cat.color,
      visible: cat.visible !== false,
    }]),
  )
})

// Add this utility function for color luminosity adjustment
const adjustColorLuminosity = (color: string, amount: number): string => {
  // Handle if the color is not a hex color
  if (!color.startsWith('#')) return color

  // Convert hex to RGB
  let r = parseInt(color.slice(1, 3), 16)
  let g = parseInt(color.slice(3, 5), 16)
  let b = parseInt(color.slice(5, 7), 16)

  // Increase the luminosity (this is a simple HSL-like luminosity adjustment)
  r = Math.min(255, Math.floor(r + (255 - r) * amount))
  g = Math.min(255, Math.floor(g + (255 - g) * amount))
  b = Math.min(255, Math.floor(b + (255 - b) * amount))

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

const getDayColor = (event: DateEventsObject | null, isInThePast: boolean): string => {
  const defaultColor = isInThePast ? cellColors.pastEmpty : adjustColorLuminosity(cellColors.pastEmpty, 0.6)

  if (!event?.events?.length || props.showEvents === false) {
    return defaultColor
  }

  const visibleEvents = event.events.filter((e) => {
    if (!e.category || !categoryPriorityMap.value[e.category]) return false
    return categoryPriorityMap.value[e.category]?.visible
  })

  if (!visibleEvents.length) {
    return defaultColor
  }

  const topEvent = visibleEvents.reduce((highest, current) => {
    if (!current?.category || !highest?.category) {
      return highest
    }
    const currentCat = categoryPriorityMap.value[current.category]
    const highestCat = categoryPriorityMap.value[highest.category]
    if (!currentCat || !highestCat) {
      return highest
    }

    return currentCat.priority > highestCat.priority ? current : highest
  }, visibleEvents[0])

  if (!topEvent?.category) {
    return defaultColor
  }

  const category = categoryPriorityMap.value[topEvent.category]
  if (!category?.visible) {
    return defaultColor
  }

  const isLongEvent = topEvent.endDate && dayjs(topEvent.endDate).diff(dayjs(topEvent.startDate), 'day') > 0

  // Apply luminosity adjustment to future cells
  const categoryColor = category.color
  const categoryColorForLongEvent = isLongEvent ? adjustColorLuminosity(categoryColor, 0.4) : categoryColor
  return isInThePast ? categoryColorForLongEvent : adjustColorLuminosity(categoryColor, 0.7)
}

// Canvas drawing functions
const draw = () => {
  if (!ctx.value || !canvasRef.value) return

  const canvas = canvasRef.value
  ctx.value.clearRect(0, 0, canvas.width, canvas.height)

  if (props.zoomLevel !== 1) {
    ctx.value.save()
    ctx.value.scale(props.zoomLevel, props.zoomLevel)
  }

  drawMonthLabels()
  drawWeekdaysLabels()
  drawDayCells()

  if (props.zoomLevel !== 1) {
    ctx.value.restore()
  }
}

const drawMonthLabels = () => {
  if (!ctx.value) return

  ctx.value.font = monthsLabelsConstants.font
  ctx.value.textAlign = monthsLabelsConstants.textAlign

  monthsLabels.value.forEach((month) => {
    if (!ctx.value) return
    const isCurrentMonth = isCurrentYear.value && month.index === dayjs().month()
    ctx.value.fillStyle = isCurrentMonth ? monthsLabelsConstants.color.currentMonth : monthsLabelsConstants.color.default
    ctx.value.textRendering = 'optimizeSpeed'
    ctx.value.fillText(month.labelMonth, spacings.spaceLeft + month.translateX, spacings.spaceTop + 2)
  })
}

const drawWeekdaysLabels = () => {
  if (!ctx.value) return

  ctx.value.font = weekdaysLabels.font
  ctx.value.letterSpacing = weekdaysLabels.letterSpacing
  ctx.value.fillStyle = weekdaysLabels.color
  ctx.value.textAlign = weekdaysLabels.textAlign
  ctx.value.textRendering = 'optimizeSpeed'

  let y = spacings.spaceTop + weekdaysLabels.spaceTop
  weekdayLegend.forEach((day) => {
    ctx.value!.fillText(day.label, spacings.spaceLeft - 1 + day.x, y + day.dy)
    y += day.dy
  })
}

const drawDayCells = () => {
  if (!ctx.value) return

  const today = dayjs().format('YYYY-MM-DD')

  weeks.value.forEach((week) => {
    week.days.forEach((day) => {
      if (!ctx.value) return
      const isWeekendValue = weekendDays.includes(day.weekDay) ? 1 : 0
      const isHighlighted = highlightedDates.value.includes(day.dayId)
      const spacingValue = spacings.cellSize + spacings.cellMargin

      const x = spacings.spaceLeft + week.translateX + day.x
      const y = spacings.spaceTop + 5 + day.num * spacingValue + isWeekendValue

      // Fill rectangle
      ctx.value.fillStyle = isHighlighted ? cellColors.highlight : day.color
      ctx.value.fillRect(x, y, spacings.cellSize, spacings.cellSize)

      // Stroke for highlighted or today
      if (isHighlighted) {
        ctx.value.strokeStyle = cellColors.highlight
        ctx.value.lineWidth = 2
        ctx.value.strokeRect(x, y, spacings.cellSize, spacings.cellSize)
      }
      else if (day.dayId === today) {
        ctx.value.strokeStyle = cellColors.today
        ctx.value.lineWidth = 1
        ctx.value.strokeRect(x, y, spacings.cellSize, spacings.cellSize)
      }

      // Hover effect
      if (day.dayId === hoveredDayId.value) {
        ctx.value.strokeStyle = cellColors.hover
        ctx.value.lineWidth = 1
        ctx.value.strokeRect(x, y, spacings.cellSize, spacings.cellSize)
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
    const weekX = spacings.spaceLeft + week.translateX

    for (const day of week.days) {
      const isWeekendValue = weekendDays.includes(day.weekDay) ? 1 : 0
      const spacingValue = spacings.cellSize + spacings.cellMargin

      const cellX = weekX + day.x
      const cellY = spacings.spaceTop + 5 + day.num * spacingValue + isWeekendValue

      if (
        x >= cellX
        && x <= cellX + spacings.cellSize
        && y >= cellY
        && y <= cellY + spacings.cellSize
      ) {
        return { dayId: day.dayId }
      }
    }
  }

  return null
}

const handleCanvasAction = (event: MouseEvent) => {
  if (!canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const day = getDayFromPosition(x, y)
  if (day) {
    hoveredDayId.value = day.dayId
    props.selectEvent(day.dayId)
  }
  else {
    hoveredDayId.value = null
  }
}

const handleCanvasLeave = () => {
  hoveredDayId.value = null
  props.selectEvent('')
}
</script>

<style lang="scss">
.calendar-heatmap {
  @apply border overflow-hidden;
  &.current-year {
    @apply border-water-500;
  }
}

.calendar-heatmap-container {
  position: relative;
}
</style>
