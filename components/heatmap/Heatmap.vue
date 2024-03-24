<template>
  <svg class="calendar-heatmap" :width="width" :height="height">
    <g transform="translate(40, 20)" class="month-labels">
      <g v-for="month in monthsLabels" :key="month.label" :data-key="month.label"
        :transform="`translate(${month.translateX}, 2)`">
        <text x="0" y="0" class="month-label">
          {{ month.labelMonth }}
          <tspan class="year-label" dy="0" dx="2">{{ month.labelYear }}</tspan>
        </text>
      </g>
    </g>
    <g transform="translate(40, 28)">
      <g
        v-for="week in weeks"
        :key="week.label"
        :data-key="week.label"
        :transform="`translate(${week.translateX}, 0)`"
        >
        <rect
          v-for="day in week.days"
          @click="console.log(day.date.format('dddd DD/MM/YYYY HH:mm:ss'))"
          :data-value="day.date.format('DD/MM/YYYY')"
          :key="day.date.toISOString()"
          :y="day.num * (cellSize + cellMargin)"
          :width="cellSize"
          :height="cellSize"
          fill="#ebedf0"
          class="day"
        />
      </g>
    </g>
    <g transform="translate(40, 35)">
      <text x="0" y="0" class="day-label" text-anchor="end">
        <tspan x="-5" dy="1" dx="0">Mon</tspan>
        <tspan x="-5" dy="24" dx="0">Wed</tspan>
        <tspan x="-5" dy="24" dx="0">Fri</tspan>
      </text>
    </g>
  </svg>
  <div>
    <pre>{{ JSON.stringify(weeks, null, 2) }}</pre>
  </div>
</template>

<script lang="ts" setup>
import type { Dayjs } from 'dayjs';
export type HeatmapProps = {
  startDate: Dayjs;
  endDate: Dayjs;
  dataset: Array<{ date: string; title: string; description: string }>;
  width: number;
  height: number;
};
const props = defineProps<HeatmapProps>();

const dayjs = useDayjs();

const cellSize = 10;
const cellMargin = 2;

const weekdayLegend = ['Mon', '', 'Wed', '', 'Fri', '', ''];

const startDateComputed = computed(() => dayjs(props.startDate).startOf('day'));
const endDateComputed = computed(() => {
  const end = dayjs(props.endDate).endOf('day');
  const maxEnd = startDateComputed.value.add(11, 'month').endOf('month');
  return end.isBefore(maxEnd) ? end : maxEnd;
});


const isInRange = (date: Dayjs) => date.isBetween(startDateComputed.value, endDateComputed.value, 'day', '[]');

// Array of each week in a period, starting on firstDayOfWeek
const weeks = computed(() => {
  const weeksCount = endDateComputed.value.diff(startDateComputed.value, 'week') + 1;

  return Array.from({ length: weeksCount }, (_, weekIndex) => {
    const startOfWeek = startDateComputed.value.clone().add(weekIndex, 'week').startOf('isoWeek');
    const endOfWeek = startOfWeek.clone().endOf('isoWeek');

    const days = Array.from({ length: 7 }, (__, dayIndex) => {
      const day = startOfWeek.clone().add(dayIndex, 'day').startOf('day');
      return {
        date: day,
        num: dayIndex,
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

    return {
      startDate: month.startOf('month'),
      endDate: month.endOf('month'),
      index: i,
      labelMonth: month.format('MMM'),
      labelYear: month.format('YY'),
      label: month.format('MMM YY'),
      translateX: weeks.value.find((week) => week.startDate.isSame(month, 'month'))?.translateX || 0,
    };
  })
});



type Day = {
  date: Dayjs;
  num: number;
  label: string;
};

type Week = {
  start: Dayjs;
  end: Dayjs;
  num: number;
  label: string;
  days: Day[];
};

type Month = {
  start: Dayjs;
  num: number;
  labelMonth: string;
  labelYear: string;
  label: string;
  translateX: number;
  weeks: Week[];
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
