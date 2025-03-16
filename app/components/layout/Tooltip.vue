<template>
  <div />
</template>

<script setup lang="ts">
import { useTippy } from 'vue-tippy'
import EventTooltip from '~/components/EventTooltip.vue'

const appStore = useAppStore()
const { selectedEvent } = storeToRefs(appStore)

const { show, hide, tippy } = useTippy(() => document.body, {
  placement: 'top',
  duration: [300, 250],
  content: EventTooltip,
  followCursor: true,
  trigger: 'manual',
  showOnCreate: false,
  hideOnClick: false,
})

watch(selectedEvent, () => {
  if (selectedEvent.value) {
    tippy.value?.popperInstance?.update()
    show()
  }
  else {
    hide()
  }
})
</script>
