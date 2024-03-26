import { useTippy } from "vue-tippy";
import EventTooltip from "~/components/EventTooltip.vue";

export const useTippyStore = defineStore('tippy-singleton-store', () => {
  const appStore = useAppStore();
  const { selectedEvent } = storeToRefs(appStore);

  const { show, hide, tippy } = useTippy(() => document.body, {
    content: EventTooltip,
    duration: 300,
    showOnCreate: false,
    allowHTML: true,
    followCursor: true,
    trigger: "manual",
    placement: "top",
    hideOnClick: false,
  });

  watch(selectedEvent, () => {
    if (selectedEvent.value) {
      tippy.value?.popperInstance?.update();
      show();
    } else {
      hide();
    }
  });
  return {
    show,
    hide,
  }
})