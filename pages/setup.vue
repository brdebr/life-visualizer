<template>
  <div class="max-w-[600px] mx-auto">
    <Heading />
    <h1 class="mb-3 mt-3 prose">
      What was the first day of your life?
    </h1>
    <div class="flex gap-3 mb-3">
      <UFormGroup label="Day" class="max-w-[100px]">
        <UInput
          color="white"
          type="number"
          variant="outline"
          placeholder="01-31"
          max="31"
          min="1"
          v-model="bornDay"
        />
      </UFormGroup>
      <UFormGroup label="Month" class="max-w-[100px]">
        <UInput
          color="white"
          type="number"
          variant="outline"
          placeholder="01-12"
          max="12"
          min="1"
          v-model="bornMonth"
        />
      </UFormGroup>
      <UFormGroup label="Year" class="max-w-[100px]">
        <UInput
          color="white"
          type="number"
          variant="outline"
          :max="$dayjs().year()"
          min="1900"
          :placeholder="'1900-'+$dayjs().year()"
          v-model="bornYear"
        />
      </UFormGroup>
      <UFormGroup label="Full date" class="w-5/12 ml-auto">
        <UInput
          color="white"
          disabled
          variant="outline"
          :model-value="computedDate"
        >
          <template #trailing>
            <span class="text-xs prose">{{ currentAge }} years</span>
          </template>
        </UInput>
      </UFormGroup>
    </div>
    <div class="flex gap-3">
      <UFormGroup label="How many years do you expect to live?">
        <UInput
          color="white"
          type="number"
          variant="outline"
          placeholder="Amount of years"
          v-model="expectedYearsToLive"
        />
      </UFormGroup>
      <UFormGroup label="Days lived / Days to live" class="w-5/12 ml-auto">
        <UInput
          color="white"
          disabled
          variant="outline"
          :model-value="`${amountOfDaysLived}${amountOfDaysInExpectedYears}`"
        >
          <template #trailing>
            <span class="text-xs prose">{{ percentOfLife }}</span>
          </template>
        </UInput>
      </UFormGroup>
    </div>
    <div class="my-6">
      <UButton :loading block @click="handleClick" color="primary">
        Calculate
      </UButton>
    </div>
  </div>
</template>
<script setup lang="ts">
useHead({
  title: 'Setup'
})
const appStore = useAppStore();
const router = useRouter();

const bornDay = ref(parseInt(appStore.wasBornDate?.split('-')[2]))
const bornMonth = ref(parseInt(appStore.wasBornDate?.split('-')[1]))
const bornYear = ref(parseInt(appStore.wasBornDate?.split('-')[0]))

const expectedYearsToLive = ref(appStore.yearsToLive);

const loading = ref(false);

const hasAllFields = computed(() => {
  return bornDay.value && bornMonth.value && `${bornYear.value}`.length === 4 && expectedYearsToLive.value;
});

const computedDate = computed(() => {
  if (!hasAllFields.value) return '';
  return appStore.dayjs(`${bornYear.value}-${bornMonth.value}-${bornDay.value}`).format('dddd, DD/MM/YYYY');
});

const currentAge = computed(() => {
  if (!hasAllFields.value) return '';
  const start = appStore.dayjs(`${bornYear.value}-${bornMonth.value}-${bornDay.value}`);
  if (!start.isValid()) return '';
  const end = appStore.dayjs();
  return end.diff(start, 'years');
});

const amountOfDaysLived = computed(() => {
  if (!hasAllFields.value) return '';
  const start = appStore.dayjs(`${bornYear.value}-${bornMonth.value}-${bornDay.value}`);
  if (!start.isValid()) return '';
  const end = appStore.dayjs();
  return end.diff(start, 'days') + ' / ';
});

const amountOfDaysInExpectedYears = computed(() => {
  if (!hasAllFields.value) return '';
  const start = appStore.dayjs(`${bornYear.value}-${bornMonth.value}-${bornDay.value}`);
  if (!start.isValid()) return '';
  const end = start.add(expectedYearsToLive.value, 'years');
  return end.diff(start, 'days');
});

const percentOfLife = computed(() => {
  if (!hasAllFields.value) return '';
  const start = appStore.dayjs(`${bornYear.value}-${bornMonth.value}-${bornDay.value}`);
  if (!start.isValid()) return '';
  const end = start.add(expectedYearsToLive.value, 'years');
  const diff = end.diff(start, 'day');
  const currentDay = appStore.dayjs().diff(start, 'day');
  const percent = ((currentDay / diff) * 100);
  if (percent > 100) {
    return '';
  }
  return `${percent.toFixed(2)}%`;
});


const handleClick = () => {
  if (!bornDay.value || !bornMonth.value || !bornYear.value || !expectedYearsToLive.value) return;
  appStore.wasBornDate = `${bornYear.value}-${bornMonth.value}-${bornDay.value}`;
  appStore.yearsToLive = expectedYearsToLive.value;
  loading.value = true;
  appStore.calculate();
  setTimeout(() => {
    router.push('/calendar');
  }, 350);
};
</script>