<template>
  <div class="max-w-[600px] mx-auto">
    <Heading />
    <h1 class="mb-3 mt-3 prose">
      What was the first day of your life?
    </h1>
    <form @submit.prevent="handleClick" autocomplete="off">
      <div class="flex gap-3 mb-3">
        <UFormGroup label="Day" class="max-w-[100px]">
          <ClientOnly>
            <UInput
              color="white"
              type="number"
              variant="outline"
              placeholder="01-31"
              max="31"
              min="1"
              v-model="bornDay"
            />
            <template #fallback>
              <UInput
                color="white"
                type="number"
                variant="outline"
                placeholder="01-31"
                max="31"
                min="1"
                model-value="1"
              />
            </template>
          </ClientOnly>
        </UFormGroup>
        <UFormGroup label="Month" class="max-w-[100px]">
          <ClientOnly>
            <UInput
              color="white"
              type="number"
              variant="outline"
              placeholder="01-12"
              max="12"
              min="1"
              v-model="bornMonth"
            />
            <template #fallback>
              <UInput
                color="white"
                type="number"
                variant="outline"
                placeholder="01-12"
                max="12"
                min="1"
                model-value="1"
              />
            </template>
          </ClientOnly>
        </UFormGroup>
        <UFormGroup label="Year" class="max-w-[100px]">
          <ClientOnly>
            <UInput
              color="white"
              type="number"
              variant="outline"
              placeholder="YYYY"
              max="2022"
              min="1900"
              v-model="bornYear"
            />
            <template #fallback>
              <UInput
                color="white"
                type="number"
                variant="outline"
                placeholder="YYYY"
                max="2022"
                min="1900"
                model-value="1970"
              />
            </template>
          </ClientOnly>
        </UFormGroup>
        <UFormGroup label="Full date" class="w-5/12 ml-auto">
          <ClientOnly>
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
            <template #fallback>
              <UInput
                color="white"
                disabled
                variant="outline"
                model-value="Monday, 01/01/1970"
              >
                <template #trailing>
                  <span class="text-xs prose">0 years</span>
                </template>
              </UInput>
            </template>
          </ClientOnly>
        </UFormGroup>
      </div>
      <div class="flex gap-3 mt-6">
        <UFormGroup label="How many years do you expect to live?" class="min-w-[272px]">
          <ClientOnly>
            <UInput
              color="white"
              type="number"
              variant="outline"
              placeholder="Amount of years"
              v-model="expectedYearsToLive"
            />
            <template #fallback>
              <UInput
                color="white"
                type="number"
                variant="outline"
                placeholder="Amount of years"
                model-value="105"
              />
            </template>
          </ClientOnly>
        </UFormGroup>
        <UFormGroup label="Days lived / Days to live" class="w-5/12 ml-auto">
          <ClientOnly>
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
            <template #fallback>
              <UInput
                color="white"
                disabled
                variant="outline"
                model-value="0 / 0"
              >
                <template #trailing>
                  <span class="text-xs prose">0%</span>
                </template>
              </UInput>
            </template>
          </ClientOnly>
        </UFormGroup>
      </div>
      <div class="mt-9">
        <UButton :loading block type="submit" color="primary">
          <template #default>
            Calculate
          </template>
          <template #trailing>
            <UIcon name="material-symbols:event-upcoming-rounded" dynamic class="size-5" />
          </template>
        </UButton>
      </div>
    </form>
  </div>
</template>
<script setup lang="ts">
useHead({
  title: 'Setup'
})
const appStore = useAppStore();
const setupStore = useSetupStore();
const { savedWasBornDate, savedYearsToLive } = storeToRefs(setupStore);
const router = useRouter();

const bornDay = ref(parseInt(savedWasBornDate.value?.split('-')[2]))
const bornMonth = ref(parseInt(savedWasBornDate.value?.split('-')[1]))
const bornYear = ref(parseInt(savedWasBornDate.value?.split('-')[0]))

const expectedYearsToLive = ref(savedYearsToLive.value);

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
  return end.diff(start, 'days').toLocaleString('en') + ' / ';
});

const amountOfDaysInExpectedYears = computed(() => {
  if (!hasAllFields.value) return '';
  const start = appStore.dayjs(`${bornYear.value}-${bornMonth.value}-${bornDay.value}`);
  if (!start.isValid()) return '';
  const end = start.add(expectedYearsToLive.value, 'years');
  return end.diff(start, 'days').toLocaleString('en');
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
  const date = `${bornYear.value}-${bornMonth.value}-${bornDay.value}`;
  appStore.wasBornDate = date;
  appStore.yearsToLive = expectedYearsToLive.value;

  savedWasBornDate.value = date;
  savedYearsToLive.value = expectedYearsToLive.value;

  loading.value = true;
  appStore.calculate();
  setTimeout(() => {
    router.push('/calendar');
  }, 350);
};
</script>