<template>
  <div class="mx-auto min-h-[100dvh]">
    <h1 class="text-slate-600 text-center">Life Visualizer</h1>
    <h1 class="text-slate-600 text-center">Current year {{ percentOfCurrentYear }}</h1>
    <div>
      <Heatmap
        v-bind="{
          startDate: dayjs().startOf('year'),
          endDate: dayjs().endOf('year'),
          dataset: dynamicDataset,
        }"
      />
    </div>
    <input type="date" v-model="wasBorn" />
    <input type="number" v-model="yearsToLive" />
    <div class="flex flex-wrap justify-center gap-2 max-w-[100vw]">
      <Heatmap
        v-for="year in arrayOfLifeYears"
        :key="year.startDate.year()"
          v-bind="{
            startDate: year.startDate,
            endDate: year.endDate,
            dataset: dynamicDataset,
          }"
        />
    </div>
  </div>
</template>
<script setup lang="ts">

const wasBorn = ref('1993-08-09');
const yearsToLive = ref(4);
const debouncedYearsToLive = debouncedRef(yearsToLive, 500);

const dayjs = useDayjs();

// Will return the percentage of the current year, for example, if today is 2022-08-09, it will return 0.5
const percentOfCurrentYear = computed(() => {
  const currentYear = dayjs().year();
  const startDate = dayjs(`${currentYear}-01-01`);
  const endDate = dayjs(`${currentYear}-12-31`);
  const diff = endDate.diff(startDate, 'day');
  const currentDay = dayjs().dayOfYear();
  return `${((currentDay / diff) * 100).toFixed(2)}%`;
});

const arrayOfLifeYears = computed(() => {
  return Array.from({ length: debouncedYearsToLive.value + 1 }, (_, i) => {
    return {
      startDate: dayjs(`${parseInt(wasBorn.value) + i}-01-01`),
      endDate: dayjs(`${parseInt(wasBorn.value) + i}-12-31`),
    }
  });
});

const dynamicDataset = computed(() => {
  const wasBornDate = dayjs(wasBorn.value).format('YYYY-MM-DD');
  const startSchoolDate = dayjs(wasBorn.value).add(5, 'year').format('YYYY-MM-DD');
  const endSchoolDate = dayjs(wasBorn.value).add(18, 'year').format('YYYY-MM-DD');
  const startCollegeDate = dayjs(wasBorn.value).add(18, 'year').format('YYYY-MM-DD');
  const endCollegeDate = dayjs(wasBorn.value).add(22, 'year').format('YYYY-MM-DD');
  const startWorkDate = dayjs(wasBorn.value).add(22, 'year').format('YYYY-MM-DD');
  const endWorkDate = dayjs(wasBorn.value).add(65, 'year').format('YYYY-MM-DD');
  const startRetirementDate = dayjs(wasBorn.value).add(65, 'year').format('YYYY-MM-DD');
  const endRetirementDate = dayjs(wasBorn.value).add(100, 'year').format('YYYY-MM-DD');

  const birthdays = Array.from({ length: yearsToLive.value + 1 }, (_, i) => {
    if (i % 10 === 0) {
      return { "date": dayjs(`${parseInt(wasBorn.value) + i}-08-09`).format('YYYY-MM-DD'), "title": "Birthday", "description": `${i}` }
    } else {
      return { "date": dayjs(`${parseInt(wasBorn.value) + i}-08-09`).format('YYYY-MM-DD'), "title": "Birthday", "description": `${i}` }
    }
  });
  const finalDataset = [
    ...staticDataset,
    ...birthdays,
    { "date": wasBornDate, "title": "Birth", "description": "You were born." },
    { "date": startSchoolDate, "title": "Start of School", "description": "You started school." },
    { "date": endSchoolDate, "title": "End of School", "description": "You finished school." },
    { "date": startCollegeDate, "title": "Start of College", "description": "You started college." },
    { "date": endCollegeDate, "title": "End of College", "description": "You finished college." },
    { "date": startWorkDate, "title": "Start of Work", "description": "You started working." },
    { "date": endWorkDate, "title": "End of Work", "description": "You retired." },
    { "date": startRetirementDate, "title": "Start of Retirement", "description": "You started retirement." },
    { "date": endRetirementDate, "title": "End of Retirement", "description": "You are a hundred years old!!" },
  ].filter((event): event is { date: string; title: string; description: string } => !!event);
  // Return an object with the date as the key and the rest as the value
  return finalDataset.reduce((acc, event) => {
    acc[event.date] = { title: event.title, description: event.description };
    return acc;
  }, {} as Record<string, { title: string; description: string }>);
});

const staticDataset = [
  { "date": "1903-12-17", "title": "First Powered Flight", "description": "The Wright brothers, Orville and Wilbur Wright, successfully conducted the first powered, sustained, and controlled airplane flight in Kitty Hawk, North Carolina." },
  { "date": "1912-04-15", "title": "Sinking of the Titanic", "description": "The RMS Titanic, the largest ship afloat at the time it entered service, sank in the North Atlantic Ocean after hitting an iceberg during its maiden voyage from Southampton to New York City." },
  { "date": "1914-07-28", "title": "Start of World War I", "description": "World War I began after the assassination of Archduke Franz Ferdinand of Austria, leading to a major conflict that involved many of the world's great powers." },
  { "date": "1929-10-29", "title": "Stock Market Crash of 1929", "description": "A major stock market crash hit the New York Stock Exchange, leading to the Great Depression, affecting the world economy for over a decade." },
  { "date": "1939-09-01", "title": "Beginning of World War II", "description": "World War II began with the invasion of Poland by Nazi Germany, eventually becoming the deadliest conflict in human history." },
  { "date": "1945-08-06", "title": "Atomic Bombing of Hiroshima", "description": "The United States dropped an atomic bomb on the Japanese city of Hiroshima, marking the first time a nuclear weapon was used in war." },
  { "date": "1969-07-20", "title": "First Man on the Moon", "description": "Neil Armstrong became the first human to step on the moon during NASA's Apollo 11 mission, marking a significant achievement in space exploration." },
  { "date": "1986-04-26", "title": "Chernobyl Nuclear Disaster", "description": "The Chernobyl Nuclear Power Plant in the Soviet Union suffered a catastrophic nuclear accident, causing widespread environmental and health effects." },
  { "date": "1989-11-09", "title": "Fall of the Berlin Wall", "description": "The Berlin Wall, a symbol of the Cold War division between East and West Germany, was brought down, leading to the eventual reunification of Germany." },
  { "date": "1997-08-31", "title": "Death of Princess Diana", "description": "Princess Diana died in a car crash in Paris, leading to widespread media attention and public mourning around the world." },
  { "date": "2001-09-11", "title": "September 11 Attacks", "description": "A series of four coordinated terrorist attacks by the Islamic terrorist group al-Qaeda against the United States, including the destruction of the World Trade Center towers in New York City." },
  { "date": "2004-12-26", "title": "Indian Ocean Tsunami", "description": "A devastating tsunami, triggered by a magnitude 9.1–9.3 earthquake, struck the coasts of several countries around the Indian Ocean, causing over 230,000 deaths in 14 countries." },
  { "date": "2008-09-15", "title": "Global Financial Crisis", "description": "Marked by the collapse of Lehman Brothers, this financial crisis was the worst since the Great Depression, leading to significant economic downturns worldwide." },
  { "date": "2011-03-11", "title": "Fukushima Nuclear Disaster", "description": "Following a massive earthquake and tsunami in Japan, the Fukushima Daiichi nuclear power plant experienced a series of equipment failures, nuclear meltdowns, and releases of radioactive materials." },
  { "date": "2012-12-21", "title": "End of the Mayan Calendar", "description": "This date marked the end of a 5,126-year-long cycle in the Mesoamerican Long Count calendar, leading to widespread discussions and theories about the end of the world." },
  { "date": "2014-12-17", "title": "U.S.-Cuba Relations", "description": "The United States and Cuba announced efforts to normalize relations between the two countries, ending over half a century of hostility." },
  { "date": "2016-06-23", "title": "Brexit Referendum", "description": "The United Kingdom voted to leave the European Union in a referendum, leading to political, economic, and social implications for the UK and the EU." },
  { "date": "2019-12-31", "title": "COVID-19 Pandemic Begins", "description": "The World Health Organization was alerted to several cases of pneumonia in Wuhan, China. The virus did not match any other known virus, leading to the discovery of the novel coronavirus (COVID-19)." },
  { "date": "2020-01-08", "title": "Australian Bushfires", "description": "Australia faced unprecedented bushfires that burned vast areas of land, destroyed homes, and resulted in the loss of human and animal lives." },
  { "date": "2022-02-24", "title": "Invasion of Ukraine", "description": "Russia invaded Ukraine, leading to a significant military conflict in Europe, widespread international condemnation, and severe economic sanctions against Russia." }
]
</script>
