<template>
  <Heading />
  <div class="my-3">
    <Heatmap
      v-bind="{
        startDate: startOfYear,
        endDate: endOfYear,
        zoomLevel: 1.5,
        header: `${year} is at ${appStore.percentOfCurrentYear}`
      }"
    />
  </div>
  <div class="container mx-auto my-7 px-5 pb-6" v-if="appStore.isConfigured">
    <UMeter color="teal" :value="appStore.percentOfLife" indicator>
      <template #label>
        <p class="text-sm flex items-baseline gap-8">
          <span class="text-teal-500 dark:text-teal-400">
            Percent of your life
          </span>
          <span class="prose text-[11px]">
            {{ appStore.age }} years / {{ appStore.yearsToLiveForCalc }} years
          </span>
          <span class="prose text-[11px]">
            {{ appStore.amountOfDaysLivedStr[0].toLocaleString('en') }} days / {{appStore.amountOfDaysLivedStr[1].toLocaleString('en') }} days
          </span>
        </p>
      </template>
    </UMeter>
  </div>
  <form autocomplete="off" class="mb-12">
    <UFormGroup label="Search for events" class="max-w-[420px] mx-auto">
      <UInput
        color="white"
        variant="outline"
        placeholder="Name, title, or description of the event"
        v-model="searchValue"
      />
    </UFormGroup>
  </form>
  <div class="flex flex-wrap justify-center gap-2 max-w-[100vw]" v-if="appStore.isConfigured">
    <Heatmap
      v-for="year in appStore.arrayOfLifeYears"
      :key="year.startDate"
      v-bind="{
        startDate: year.startDate,
        endDate: year.endDate,
        dataset: appStore.dynamicDataset,
        header: year.header,
      }"
    />
  </div>
</template>
<script setup lang="ts">
import Fuse from 'fuse.js';
useHead({
  title: 'Calendar'
})
const appStore = useAppStore();
const { highlightedDates } = storeToRefs(appStore);
const router = useRouter();

const fuse = new Fuse(appStore.arrayDataset, {
  isCaseSensitive: false,
  includeScore: true,
  minMatchCharLength: 3,
  ignoreLocation: true,
  keys: ['date', 'title', 'description'],
})

const searchValue = ref('');
const searchResults = ref<typeof appStore.arrayDataset>([]);

watchDebounced([searchValue], () => {
  if (!searchValue.value) {
    searchResults.value = [];
    return;
  }
  // Check if the value is YYYY-MM-DD
  if (searchValue.value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    searchResults.value = [];
    highlightedDates.value = [searchValue.value];
    return;
  }
  const results = fuse.search(searchValue.value);
  // console.log(results);
  const tenResults = results.filter(el => (el.score || 1) < 0.44).slice(0, 10).map((result) => result.item);
  // console.log(tenResults);
  searchResults.value = tenResults;
  highlightedDates.value = tenResults.map((result) => result.date);
}, { debounce: 650 });


if (!appStore.isConfigured) {
  router.push('/setup');
}

const today = appStore.dayjs().format('YYYY-MM-DD');
const year = today.slice(0, 4);
const startOfYear = `${year}-01-01`;
const endOfYear = `${year}-12-31`;
</script>
