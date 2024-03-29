<template>
  <div class="flex flex-col justify-center items-center">
    <ClientOnly>
      <h3 :style="{
        fontSize: `${props.zoomLevel * 10}px`,
      }">{{ header }}</h3>
      <svg class="calendar-heatmap" :width="computedSizes.width" :height="computedSizes.height" :viewBox="computedViewBox">
        <g :transform="transformMonthsLabel" class="month-labels">
          <g v-for="month in monthsLabels" :key="month.label" :data-key="month.label"
            :transform="`translate(${month.translateX}, 2)`">
            <text x="0" y="0" class="month-label">
              {{ month.labelMonth }}
            </text>
          </g>
        </g>
        <g :transform="transformWeeks">
          <g
            v-for="week in weeks"
            :key="week.label"
            :data-key="week.label"
            :transform="`translate(${week.translateX}, 0)`"
          >
            <rect
              v-for="day in week.days"
              :key="day.dayId"
              @click="() => appStore.selectEvent(day.dayId)"
              @mouseenter="() => appStore.selectEvent(day.dayId)"
              @mouseleave="() => appStore.selectEvent('')"
              :y="day.num * (cellSize + cellMargin) + (weekendDays.includes(day.weekDay) ? 1 : 0)"
              :x="day.x"
              :width="cellSize"
              :height="cellSize"
              :fill="highlightedDates.includes(day.dayId) ? '#ff4242' : day.color"
              :stroke="highlightedDates.includes(day.dayId) ? '#ff4242' : 'transparent'"
              :stroke-width="highlightedDates.includes(day.dayId) ? 2 : 1"
              class="day"
            />
          </g>
        </g>
        <g :transform="transformDaysLabel">
          <text x="0" y="0" class="day-label" text-anchor="end">
            <tspan v-for="day in weekdayLegend" :key="day.label" :x="day.x" :dy="day.dy" :dx="day.dx">{{ day.label }}</tspan>
          </text>
        </g>
      </svg>
      <template #fallback>
        <div
          class="mt-[15px] bg-gray-200 rounded-lg overflow-hidden relative"
          :style="{
            width: `${computedSizes.width}px`,
            height: `${computedSizes.height}px`,
          }"
        >
          <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
export type HeatmapProps = {
  startDate: string;
  endDate: string;
  header?: string;
  dataset?: {
    [key: string]: EventObject[]
  }
  width?: number;
  height?: number;
  zoomLevel?: number;
};

const props = withDefaults(defineProps<HeatmapProps>(), {
  width: 420,
  height: 57,
  zoomLevel: 1,
});

const appStore = useAppStore();
const { highlightedDates } = storeToRefs(appStore);

const weekendDays = [0, 6];

const cellSize = 5;
const cellMargin = 1;

const spaceLeft = 22;
const spaceTop = 6;

const space = 1;

const transformMonthsLabel = `translate(${spaceLeft}, ${spaceTop})`;
const transformWeeks = `translate(${spaceLeft}, ${spaceTop + 5})`;
const transformDaysLabel = `translate(${spaceLeft - 1}, ${spaceTop + 15})`;

const computedSizes = computed(() => {
  return {
    width: props.width * props.zoomLevel,
    height: props.height * props.zoomLevel,
  };
});

const computedViewBox = computed(() => {
  if (props.zoomLevel === 1) return undefined;
  return `${0} ${0} ${props.width} ${props.height}`;
});

const weekdayLegend = [
  {
    label: 'Mon',
    x: -3,
    dy: -4,
    dx: 0,
  },
  {
    label: 'Wed',
    x: -3,
    dy: 11,
    dx: 0,
  },
  {
    label: 'Fri',
    x: -3,
    dy: 12,
    dx: 0,
  },
  {
    label: 'Sun',
    x: -3,
    dy: 12,
    dx: 0,
  },
]

// Array of each week in a period, starting on firstDayOfWeek
const weeks = computed(() => {
  const year = appStore.dayjs(props.startDate).year();
  const startDateComputed = appStore.dayjs(props.startDate).startOf('day');
  const end = appStore.dayjs(props.endDate).endOf('day');
  const maxEnd = startDateComputed.add(11, 'month').endOf('month');
  const endDateComputed = end.isBefore(maxEnd) ? end : maxEnd;
  const weeksCount = endDateComputed.diff(startDateComputed, 'week') + 1;

  return Array.from({ length: weeksCount }, (_, weekIndex) => {
    const startOfWeek = startDateComputed.clone().add(weekIndex, 'week').startOf('isoWeek');
    const endOfWeek = startOfWeek.endOf('isoWeek');

    const days = Array.from({ length: 7 }, (__, dayIndex) => {
      const day = startOfWeek.clone().add(dayIndex, 'day').startOf('day');
      const dayId = day.format('YYYY-MM-DD');
      const event = appStore.getDayContent(dayId);
      const isInThePast = day.isBefore(appStore.dayjs());
      return {
        num: dayIndex,
        dayId,
        weekDay: day.day(),
        isInThePast,
        event,
        color: getDayColor(event, isInThePast),
        x: day.month() * (cellSize + cellMargin + space),
      };
    })

    return {
      startDate: startOfWeek,
      index: weekIndex,
      translateX: weekIndex * (cellSize + cellMargin),
      isFirstWeekOfMonth: days.some((day) => day.weekDay === 1),
      label: `${startOfWeek.format('DD/MM/YYYY')} - ${endOfWeek.format('DD/MM/YYYY')}`,
      days: days.filter((day) => day.dayId.slice(0, 4) === year.toString()),
    };
  });
});

const monthsLabels = computed(() => {
  const startDateComputed = appStore.dayjs(props.startDate).startOf('day');
  const end = appStore.dayjs(props.endDate).endOf('day');
  const maxEnd = startDateComputed.add(11, 'month').endOf('month');
  const endDateComputed = end.isBefore(maxEnd) ? end : maxEnd;
  const months = endDateComputed.diff(startDateComputed, 'month') + 1;

  return Array.from({ length: months }, (_, i) => {
    const month = startDateComputed.clone().add(i, 'month');
    const labelMonth = month.format('MMM');
    const labelYear = month.format('YY');
    const label = `${labelMonth} ${labelYear}`;
    const translateX = (weeks.value.find((week) => week.startDate.isSame(month, 'month'))?.translateX || 0) + (i * (cellSize + cellMargin + space));

    return {
      index: i,
      labelMonth,
      labelYear,
      label,
      translateX,
    };
  })
});

const colorsMap = {
  NO_DATA: '#e5e7eb',
  PERSONAL: '#2563eb',
  HISTORICAL: '#2dd4bf',
  PAST: '#f3f3f3',
}

const getDayColor = (event: EventsObject | null, isInThePast: boolean): string => {
  if (event?.events?.some((event) => event.type === 'personal')){
    return colorsMap.PERSONAL;
  }
  if (event?.events?.every((event) => !!event.description)){
    return colorsMap.HISTORICAL;
  }
  if (isInThePast){
    return colorsMap.PAST;
  }
  return colorsMap.NO_DATA;
};
</script>

<style lang="scss">
.calendar-heatmap {
  @apply border overflow-hidden;

  .month-label {
    @apply text-[8px] pointer-events-none select-none;
    @apply fill-slate-950 dark:fill-white;
  }

  .year-label {
    @apply text-[8px] pointer-events-none select-none;
    @apply fill-slate-950 dark:fill-white;
  }

  .day-label {
    @apply text-[8px] pointer-events-none select-none;
    @apply fill-slate-950 dark:fill-white;
  }

  .day {
    outline: none;
  }

  .day:hover {
    stroke: #000;
  }
}
</style>
