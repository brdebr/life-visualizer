<template>
  <div class="flex flex-col justify-center items-center">
    <h3 class="text-[10px]">{{ startDateComputed.year() }} {{ header }}</h3>
    <ClientOnly>
      <svg class="calendar-heatmap" :width="width" :height="height">
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
            <template v-for="day in week.days" :key="day.date.toISOString()">
              <rect
                @click="handleClick(day.date)"
                v-tippy="{ content: getDayContent(day.date) }"
                :data-value="day.date.format('DD/MM/YYYY')"
                :y="day.num * (cellSize + cellMargin) + (weekEndDays.includes(day.date.day()) ? 1 : 0)"
                :x="day.x"
                :width="cellSize"
                :height="cellSize"
                :fill="getDayColor(day.date)"
                :opacity="day.date.isBefore(dayjs()) ? 0.4 : undefined"
                class="day"
              />
            </template>
          </g>
        </g>
        <g :transform="transformDaysLabel">
          <text x="0" y="0" class="day-label" text-anchor="end">
            <tspan v-for="day in weekdayLegend" :key="day.label" :x="day.x" :dy="day.dy" :dx="day.dx">{{ day.label }}</tspan>
          </text>
        </g>
      </svg>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import type { Dayjs } from 'dayjs';
export type HeatmapProps = {
  startDate: Dayjs;
  endDate: Dayjs;
  header?: string;
  dataset?: {
    [key: string]: {
      title: string;
      description: string;
    }
  }
  width?: number;
  height?: number;
};

// import { useSingleton } from 'vue-tippy';
// const singletons = ref<Array<Element>>([])
// useSingleton(singletons, {
//   placement: 'top',
// })

const props = withDefaults(defineProps<HeatmapProps>(), {
  width: 419,
  height: 57,
});

const dayjs = useDayjs();
const weekEndDays = [0, 6];

const cellSize = 5;
const cellMargin = 1;

const spaceLeft = 22;
const spaceTop = 6;

const transformMonthsLabel = `translate(${spaceLeft}, ${spaceTop})`;
const transformWeeks = `translate(${spaceLeft}, ${spaceTop + 5})`;
const transformDaysLabel = `translate(${spaceLeft - 1}, ${spaceTop + 15})`;

// const weekdayLegend = ['Mon', '', 'Wed', '', 'Fri', '', ''];
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

const startDateComputed = computed(() => dayjs(props.startDate).startOf('day'));
const endDateComputed = computed(() => {
  const end = dayjs(props.endDate).endOf('day');
  const maxEnd = startDateComputed.value.add(11, 'month').endOf('month');
  return end.isBefore(maxEnd) ? end : maxEnd;
});


const isInRange = (date: Dayjs) => date.isBetween(startDateComputed.value, endDateComputed.value, 'day', '[]');

const space = 1;

// Array of each week in a period, starting on firstDayOfWeek
const weeks = computed(() => {
  const weeksCount = endDateComputed.value.diff(startDateComputed.value, 'week') + 1;

  return Array.from({ length: weeksCount }, (_, weekIndex) => {
    const startOfWeek = startDateComputed.value.clone().add(weekIndex, 'week').startOf('isoWeek');
    const endOfWeek = startOfWeek.endOf('isoWeek');

    const days = Array.from({ length: 7 }, (__, dayIndex) => {
      const day = startOfWeek.clone().add(dayIndex, 'day').startOf('day');
      return {
        date: day,
        num: dayIndex,
        x: day.month() * (cellSize + cellMargin + space),
        label: day.format('ddd DD/MM/YYYY HH:mm:ss'),
      };
    }).filter((day) => isInRange(day.date));

    return {
      startDate: startOfWeek,
      endDate: endOfWeek,
      index: weekIndex,
      translateX: weekIndex * (cellSize + cellMargin),
      isFirstWeekOfMonth: days.some((day) => day.date.date() === 1),
      label: `${startOfWeek.format('DD/MM/YYYY')} - ${endOfWeek.format('DD/MM/YYYY')}`,
      days,
    };
  });
});

const monthsLabels = computed(() => {
  const months = endDateComputed.value.diff(startDateComputed.value, 'month') + 1;

  return Array.from({ length: months }, (_, i) => {
    const month = startDateComputed.value.clone().add(i, 'month');
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
  HISTORICAL: '#4d7c0f',
}

const getDayColor = (date: Dayjs) => {
  const event = props.dataset?.[date.format('YYYY-MM-DD')];
  if (event?.description.startsWith('You') || event?.title === 'Birthday') {
    return colorsMap.PERSONAL;
  }
  if (event) {
    return colorsMap.HISTORICAL;
  }
  return colorsMap.NO_DATA;
};

const getDayContent = (date: Dayjs) => {
  const event = props.dataset?.[date.format('YYYY-MM-DD')];
  if (!event) {
    return `
      <div>
        <h3 class="px-2 pb-1">${date.format('dddd - DD/MM/YYYY')}</h3>
      </div>
    `;
  }
  const content = `
    <div>
      <h3 class="px-2 mb-2 border-b">${date.format('dddd - DD/MM/YYYY')}</h3>
      <h4 class="font-semibold">· ${event?.title || ''}</h4>
      <p class="p-2">${event?.description || ''}</p>
    </div>
  `
  return content;
};

const handleClick = (date: Dayjs) => {
  console.log(date.format('dddd DD/MM/YYYY HH:mm:ss'))
  const event = props.dataset?.[date.format('YYYY-MM-DD')];
  console.log(event);
};
</script>

<style lang="scss">
.calendar-heatmap {
  @apply border;

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
    stroke: transparent;
    outline: none;
    stroke-width: 1;
  }

  .day:hover {
    stroke: #000;
  }
}
</style>
