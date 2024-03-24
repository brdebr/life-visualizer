<template>
  <div class="flex flex-col justify-center items-center">
    <h3 class="text-sm">{{ startDateComputed.year() }}</h3>
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
              :data-value="day.date.format('DD/MM/YYYY')"
              :y="day.num * (cellSize + cellMargin)"
              :x="day.x"
              :width="cellSize"
              :height="cellSize"
              :fill="getDayColor(day.date)"
              :opacity="day.date.isBefore(dayjs()) ? 0.4 : undefined"
              class="day"
            />
            <text
              v-if="dataset?.[day.date.format('YYYY-MM-DD')]?.title === 'Birthday'"
              :y="day.num * (cellSize + cellMargin) + 8"
              :x="day.x + 5"
              text-anchor="middle"
              class="event-label text-[8px]"
            >
              {{ dataset?.[day.date.format('YYYY-MM-DD')].description }}
            </text>
          </template>
        </g>
      </g>
      <g :transform="transformDaysLabel">
        <text x="0" y="0" class="day-label" text-anchor="end">
          <tspan x="-5" dy="1" dx="0">Mon</tspan>
          <tspan x="-5" dy="24" dx="0">Wed</tspan>
          <tspan x="-5" dy="24" dx="0">Fri</tspan>
        </text>
      </g>
    </svg>
  </div>
</template>

<script lang="ts" setup>
import type { Dayjs } from 'dayjs';
export type HeatmapProps = {
  startDate: Dayjs;
  endDate: Dayjs;
  dataset?: {
    [key: string]: {
      title: string;
      description: string;
    }
  }
  width?: number;
  height?: number;
};
const props = withDefaults(defineProps<HeatmapProps>(), {
  width: 825,
  height: 110,
});

const dayjs = useDayjs();

const cellSize = 10;
const cellMargin = 2;

const spaceLeft = 40;
const spaceTop = 10;

const transformMonthsLabel = `translate(${spaceLeft}, ${spaceTop})`;
const transformWeeks = `translate(${spaceLeft}, ${spaceTop + 8})`;
const transformDaysLabel = `translate(${spaceLeft - 10}, ${spaceTop + 15})`;

// const weekdayLegend = ['Mon', '', 'Wed', '', 'Fri', '', ''];

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
  PERSONAL: '#bfdbfe',
  HISTORICAL: '#134e4a',
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
    @apply text-[10px];
  }

  .year-label {
    @apply text-[8px];
  }

  .day-label {
    @apply text-[10px];
  }

  .day {
    stroke: transparent;
    stroke-width: 1;
  }

  .day:hover {
    stroke: #000;
  }
}
</style>
