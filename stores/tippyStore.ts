import { useTippy } from "vue-tippy";

export const useTippyStore = defineStore('tippy-singleton-store', () => {
  const appStore = useAppStore();
  const { selectedEvent } = storeToRefs(appStore);

  const selectedEventTooltipHtml = computed(() => selectedEvent ? `
    <div class="border rounded-md min-h-[180px] container max-w-[420px] mx-auto my-3 px-3 pt-1 pb-2 grid grid-rows-[auto_auto_1fr]">
      <h3 class="px-2 pt-1 mb-2 border-b text-sm">${selectedEvent?.value?.eventDate || ''}</h3>
      <h4 class="font-semibold text-sm">· ${selectedEvent?.value?.title || 'No events this day'}</h4>
      <p class="p-2 text-sm">${selectedEvent?.value?.description || ''}</p>
    </div>
  ` : '')

  const { show, hide } = useTippy(() => document.body, {
    content: selectedEventTooltipHtml,
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