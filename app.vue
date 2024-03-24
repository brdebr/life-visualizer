<template>
  <div class="container mx-auto min-h-[100dvh]">
    <h1 class="text-slate-600">Hello world</h1>
    <p>Today is {{ $dayjs().format('DD/MM/YYYY HH:mm') }}</p>
    <p>From my Nuxt App</p>
    <div class="flex gap-2">
      <input type="number" v-model="year" />
      <input type="number" v-model="width" />
      <input type="number" v-model="height" />
    </div>
    <Heatmap
      :startDate="$dayjs(`${year}-01-01`)"
      :endDate="$dayjs(`${year}-12-31`)"
      :dataset
      :width
      :height
    />
  </div>
</template>
<script setup lang="ts">

const year = ref(2023);

const width = ref(800);
const height = ref(100);

const dataset = [
  { date: '2023-01-10', title: 'Event one', description: 'The first description' },
  { date: '2023-01-15', title: 'Event two', description: 'The second description' },
  { date: '2023-02-10', title: 'Event three', description: 'The third description' },
  { date: '2023-02-15', title: 'Event four', description: 'The fourth description' },
  { date: '2023-03-10', title: 'Event five', description: 'The fifth description' },
  { date: '2023-03-15', title: 'Event six', description: 'The sixth description' },
  { date: '2023-04-10', title: 'Event seven', description: 'The seventh description' },
  { date: '2023-04-15', title: 'Event eight', description: 'The eighth description' },
  { date: '2023-05-10', title: 'Event nine', description: 'The ninth description' },
  { date: '2023-05-15', title: 'Event ten', description: 'The tenth description' },
]
</script>
