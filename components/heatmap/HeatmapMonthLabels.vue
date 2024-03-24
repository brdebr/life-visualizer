<template>
  <g transform="translate(0, 8)" class="month-labels">
    <g v-for="month in months" :key="month.label" :data-key="month.label"
      :transform="`translate(${month.translateX}, 0)`">
      <text x="0" y="0" class="month-label">
        {{ month.labelMonth }}
        <tspan class="year-label" dy="0" dx="2">{{ month.labelYear }}</tspan>
      </text>
    </g>
  </g>
</template>
<script lang="ts" setup>
import type { MonthLabel } from './Heatmap.vue';

defineProps<{months: MonthLabel[]}>();
</script>