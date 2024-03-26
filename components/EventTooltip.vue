<template>
  <div class='border border-blue-900 rounded-md max-w-[420px] mx-auto my-3 px-3 pt-1 pb-2'>
    <h3 class="px-2 pt-1 mb-2 border-b text-sm">{{selectedEvent?.eventDate || ''}}</h3>
    <h4 class="font-semibold text-sm">· {{selectedEvent?.title || 'No events this day'}}</h4>
    <p class="p-2 text-sm">{{selectedEvent?.description || ''}}</p>
  </div>
</template>
<script setup lang="ts">
const appStore = useAppStore();
const { selectedEvent } = storeToRefs(appStore);
</script>