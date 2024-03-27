
export type EventObject = {
  title?: string;
  description?: string;
  eventDate?: string;
  type?: string;
}

export type EventsObject = {
  eventDate: string;
  events?: EventObject[];
}

export const useAppStore = defineStore('app-store', () => {
  const dayjs = useDayjs();

  const wasBornDate = ref('1970-01-01');
  const yearsToLive = ref(105);
  const isConfigured = ref(false);

  const wasBornForCalc = ref(wasBornDate.value);
  const yearsToLiveForCalc = ref(yearsToLive.value);

  const calculate = () => {
    wasBornForCalc.value = wasBornDate.value;
    yearsToLiveForCalc.value = yearsToLive.value;
    isConfigured.value = true;
  };

  const percentOfCurrentYear = computed(() => {
    const currentDate = dayjs()
    const startDate = currentDate.startOf('year');
    const endDate = currentDate.endOf('year');
    const diff = endDate.diff(startDate, 'day');
    const currentDay = currentDate.dayOfYear();
    return `${((currentDay / diff) * 100).toFixed(2)}%`;
  });

  const arrayOfLifeYears = computed(() => {
    return Array.from({ length: yearsToLiveForCalc.value + 1 }, (_, i) => {
      return {
        startDate: `${parseInt(wasBornForCalc.value) + i}-01-01`,
        endDate: `${parseInt(wasBornForCalc.value) + i}-12-31`,
        header: `${parseInt(wasBornForCalc.value.slice(0, 4), 10) + i} - [ ${i} years old ]`,
      }
    });
  });

  const percentOfLife = computed(() => {
    const startDate = dayjs(wasBornForCalc.value);
    const endDate = startDate.clone().add(yearsToLiveForCalc.value, 'year');
    const diff = endDate.diff(startDate, 'day');
    const currentDay = dayjs().diff(startDate, 'day');
    const percent = ((currentDay / diff) * 100);
    if (percent > 100) {
      return 100;
    }

    return percent;
  });

  const dynamicDataset = computed(() => {
    if(!isConfigured.value) {
      return {};
    }
    const wasBorn = dayjs(wasBornForCalc.value);
    const wasBornDate = wasBorn.format('YYYY-MM-DD');
    const startSchoolDate = wasBorn.clone().add(5, 'year').month(9).day(15).format('YYYY-MM-DD');
    const legalAgeDate = wasBorn.clone().add(18, 'year').format('YYYY-MM-DD');
    const endCollegeDate = wasBorn.clone().add(22, 'year').month(5).day(15).format('YYYY-MM-DD');
    const startWorkDate = wasBorn.clone().add(22, 'year').add(6, 'month').format('YYYY-MM-DD');
    const startRetirementDate = wasBorn.clone().add(65, 'year').format('YYYY-MM-DD');
  
    const birthdays = Array.from({ length: yearsToLiveForCalc.value + 1 }, (_, i) => {
        if (i === 0) return { "date": wasBornDate, "title": "Birth", "description": "You were born.", "type": "personal" };
        if (i === 1) return { "date": `${parseInt(wasBornForCalc.value.slice(0, 4), 10) + i}${wasBornDate.slice(4)}`, "title": "First Birthday", "description": "It's your first birthday.", "type": "personal" };
        if (i === 100) return { "date": `${parseInt(wasBornForCalc.value.slice(0, 4), 10) + i}${wasBornDate.slice(4)}`, "title": "Hundredth Birthday", "description": "You are a hundred years old!!", "type": "personal" };
        return { "date": `${parseInt(wasBornForCalc.value.slice(0, 4), 10) + i}${wasBornDate.slice(4)}`, "title": "Birthday", "description": `It's your ${i} birthday !!`, "type": "personal" };
    });

    const personalEvents = [
      ...birthdays,
      { "date": startSchoolDate, "title": "Start of School", "description": "You started school.", "type": "personal" },
      { "date": legalAgeDate, "title": "Legal Age", "description": "You reached the legal age.", "type": "personal" },
      { "date": endCollegeDate, "title": "End of College", "description": "You finished college.", "type": "personal" },
      { "date": startWorkDate, "title": "Start of Work", "description": "You started working.", "type": "personal" },
      { "date": startRetirementDate, "title": "Start of Retirement", "description": "You started retirement.", "type": "personal" },
    ];

    const finalDataset: {
      date: string;
      title: string;
      description: string;
      type?: string;
    }[] = [
      ...staticDataset,
      ...personalEvents,
    ];
    const finalRecord = finalDataset.reduce((acc, event) => {
      const events = acc[event.date] || [];
      events.push({ title: event.title, description: event.description, type: event.type });

      acc[event.date] = events;
      return acc;
    }, {} as Record<string, EventObject[]>);
    // console.log(finalRecord);
    // console.log('duplikates', Object.values(finalRecord).filter((item) => item.length > 1));
    return finalRecord;
  });

  const selectedEvent = ref<EventsObject | null>(null);
  const selectEvent = useDebounceFn((date: string) => {
    if (!date) {
      selectedEvent.value = null;
      return;
    }
    selectedEvent.value = getDayContent(date);
  }, 250);

  const getDayContent = (date: string): EventsObject => {
    const events = dynamicDataset.value?.[date];
    const eventDate = dayjs(date).format('dddd - YYYY-MM-DD');
    if (!events?.length) {
      return {
        eventDate,
        events: [{ title: 'No events for this day.', description: '' }],
      };
    }
    return {
      eventDate,
      events: events,
    };
  };

  return {
    dayjs,
    wasBornDate,
    yearsToLive,
    percentOfCurrentYear,
    percentOfLife,
    wasBornForCalc,
    yearsToLiveForCalc,
    calculate,
    dynamicDataset,
    arrayOfLifeYears,
    getDayContent,
    selectedEvent,
    selectEvent,
    isConfigured,
  }
})