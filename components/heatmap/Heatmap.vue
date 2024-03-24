<template>
  <svg class="calendar-heatmap" :width="width" :height="height">
    <g transform="translate(0, 8)" class="month-labels">
      <g v-for="month in monthsLabels" :key="month.label" :data-key="month.label"
        :transform="`translate(${month.translateX}, 0)`">
        <text x="0" y="0" class="month-label">
          {{ month.labelMonth }}
          <tspan class="year-label" dy="0" dx="2">{{ month.labelYear }}</tspan>
        </text>
      </g>
    </g>
    <g transform="translate(10, 15)">
      <g
        v-for="week in weeks"
        :key="week.label"
        :data-key="week.label"
        :transform="`translate(${week.num * (cellSize + cellMargin)}, 0)`"
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

const startComputed = computed(() => dayjs(props.startDate).startOf('day'));
const endComputed = computed(() => {
  const end = dayjs(props.endDate).endOf('day');
  const maxEnd = startComputed.value.add(11, 'month').endOf('month');
  return end.isBefore(maxEnd) ? end : maxEnd;
});

export type MonthLabel = {
  start: Dayjs;
  end: Dayjs;
  num: number;
  labelMonth: string;
  labelYear: string;
  label: string;
  translateX: number;
}

const monthsLabels = computed<MonthLabel[]>(() => {
  const months = endComputed.value.diff(startComputed.value, 'month') + 1;

  return Array.from({ length: months }, (_, i) => {
    const month = startComputed.value.clone().add(i, 'month');
    const weeksInMonth = Math.ceil(month.daysInMonth() / 7);

    return {
      start: month.startOf('month'),
      end: month.endOf('month'),
      num: i,
      labelMonth: month.format('MMM'),
      labelYear: month.format('YY'),
      label: month.format('MMM YY'),
      translateX: (i * weeksInMonth) * (cellSize + cellMargin),
    };
  })
});

const isInRange = (date: Dayjs) => date.isBetween(startComputed.value, endComputed.value, 'day', '[]');

// Array of each week in a period, starting on firstDayOfWeek
const weeks = computed(() => {
  const weeksCount = endComputed.value.diff(startComputed.value, 'week') + 1;

  return Array.from({ length: weeksCount }, (_, weekIndex) => {
    const startOfWeek = startComputed.value.clone().add(weekIndex, 'week').startOf('isoWeek');
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
      start: startOfWeek,
      end: endOfWeek,
      num: weekIndex,
      isFirstWeekOfMonth: days.some((day) => day.date.date() === 1),
      label: `${startOfWeek.format('DD/MM/YYYY')} - ${endOfWeek.format('DD/MM/YYYY')}`,
      days,
    };
  });
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

  .day {
    stroke: #fff;
    stroke-width: 1;
  }

  .day:hover {
    stroke: #000;
  }
}
</style>
