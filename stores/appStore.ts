
export type EventObject = {
  title?: string;
  description?: string;
  eventDate?: string;
}

export const useAppStore = defineStore('app', () => {
  const dayjs = useDayjs();

  const wasBornDate = ref('1993-08-09');
  const yearsToLive = ref(10);

  const debouncedWasBorn = ref(wasBornDate.value);
  const debouncedYearsToLive = ref(yearsToLive.value);

  const percentOfCurrentYear = computed(() => {
    const currentDate = dayjs()
    const startDate = currentDate.startOf('year');
    const endDate = currentDate.endOf('year');
    const diff = endDate.diff(startDate, 'day');
    const currentDay = currentDate.dayOfYear();
    return `${((currentDay / diff) * 100).toFixed(2)}%`;
  });

  const arrayOfLifeYears = computed(() => {
    return Array.from({ length: debouncedYearsToLive.value + 1 }, (_, i) => {
      return {
        startDate: dayjs(`${parseInt(debouncedWasBorn.value) + i}-01-01`),
        endDate: dayjs(`${parseInt(debouncedWasBorn.value) + i}-12-31`),
        header: `- [ ${i} years old ]`,
      }
    });
  });

  const percentOfLife = computed(() => {
    const startDate = dayjs(debouncedWasBorn.value);
    const endDate = startDate.clone().add(debouncedYearsToLive.value, 'year');
    const diff = endDate.diff(startDate, 'day');
    const currentDay = dayjs().diff(startDate, 'day');
    return `${((currentDay / diff) * 100).toFixed(2)}%`;
  });

  watchDebounced([wasBornDate, yearsToLive], () => {
    debouncedWasBorn.value = wasBornDate.value;
    debouncedYearsToLive.value = yearsToLive.value;
  }, { debounce: 1000, maxWait: 60 * 1000});

  const dynamicDataset = computed(() => {
    const wasBorn = dayjs(debouncedWasBorn.value);
    const wasBornDate = wasBorn.format('YYYY-MM-DD');
    const startSchoolDate = wasBorn.clone().add(5, 'year').format('YYYY-MM-DD');
    const endSchoolDate = wasBorn.clone().add(18, 'year').format('YYYY-MM-DD');
    const legalAgeDate = wasBorn.clone().add(18, 'year').format('YYYY-MM-DD');
    const endCollegeDate = wasBorn.clone().add(22, 'year').format('YYYY-MM-DD');
    const startWorkDate = wasBorn.clone().add(22, 'year').format('YYYY-MM-DD');
    const endWorkDate = wasBorn.clone().add(65, 'year').format('YYYY-MM-DD');
    const startRetirementDate = wasBorn.clone().add(65, 'year').format('YYYY-MM-DD');
    const endRetirementDate = wasBorn.clone().add(100, 'year').format('YYYY-MM-DD');
  
    const birthdays = Array.from({ length: yearsToLive.value + 1 }, (_, i) => {
        return { "date": dayjs(`${parseInt(debouncedWasBorn.value) + i}-08-09`).format('YYYY-MM-DD'), "title": "Birthday", "description": `It's your ${i} birthday !!` }
    });
    const finalDataset = [
      ...staticDataset,
      ...birthdays,
      { "date": wasBornDate, "title": "Birth", "description": "You were born." },
      { "date": startSchoolDate, "title": "Start of School", "description": "You started school." },
      { "date": endSchoolDate, "title": "End of School", "description": "You finished school." },
      { "date": legalAgeDate, "title": "Legal Age", "description": "You reached the legal age." },
      { "date": endCollegeDate, "title": "End of College", "description": "You finished college." },
      { "date": startWorkDate, "title": "Start of Work", "description": "You started working." },
      { "date": endWorkDate, "title": "End of Work", "description": "You retired." },
      { "date": startRetirementDate, "title": "Start of Retirement", "description": "You started retirement." },
      { "date": endRetirementDate, "title": "End of Retirement", "description": "You are a hundred years old!!" },
    ]
    // Return an object with the date as the key and the rest as the value
    return finalDataset.reduce((acc, event) => {
      acc[event.date] = { title: event.title, description: event.description };
      return acc;
    }, {} as Record<string, EventObject>);
  });

  const selectedEvent = ref<EventObject | null>(null);
  const selectEvent = useDebounceFn((date: string) => {
    if (!date) {
      selectedEvent.value = null;
      return;
    }
    selectedEvent.value = getDayContent(date);
  }, 300);
  

  const getDayContent = (date: string): EventObject | null => {
    const event = dynamicDataset.value?.[date];
    const eventDate = dayjs(date).format('dddd - YYYY-MM-DD');
    if (!event) {
      return {
        eventDate,
      };
    }
    return {
      ...event,
      eventDate,
    };
    // if (!event) {
    //   return `
    //     <div>
    //       <h3 class="px-2 pb-1">${eventDate}</h3>
    //     </div>
    //   `;
    // }
    // const content = `
    //   <div>
    //     <h3 class="px-2 mb-2 border-b">${eventDate}</h3>
    //     <h4 class="font-semibold">· ${event?.title || ''}</h4>
    //     <p class="p-2">${event?.description || ''}</p>
    //   </div>
    // `
    // return content;
  };


  return {
    wasBornDate,
    yearsToLive,
    percentOfCurrentYear,
    percentOfLife,
    debouncedWasBorn,
    debouncedYearsToLive,
    dynamicDataset,
    arrayOfLifeYears,
    getDayContent,
    selectedEvent,
    selectEvent,
  }
})