<template>
  <div>
    <h1>
      What was the first day of your life?
    </h1>
    <div class="flex gap-3">
      <UInput
        color="white"
        variant="outline"
        placeholder="Day"
        v-model="day"
      />
      <UInput
        color="white"
        variant="outline"
        placeholder="Month"
        v-model="month"
      />
      <UInput
        color="white"
        variant="outline"
        placeholder="Year"
        v-model="year"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
const day = ref('');
const month = ref('');
const year = ref('');
</script>