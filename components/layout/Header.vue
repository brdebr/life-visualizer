<template>
  <div class="header-container">
    <header ref="headerElement" class="header">
      <div class="w-full flex justify-start gap-2 px-2">
        <UDropdown :items :popper="{ placement: 'bottom-start' }">
          <UButton square color="primary" size="xs" variant="outline" icon="i-heroicons-bars-3-16-solid" />
        </UDropdown>
      </div>
      <div class="w-fit">
        <h1>
          <span>
            Life Visualizer
          </span>
          <img class="logo" src="/logo-icon-bg.png" alt="logo" width="12" height="12" />
        </h1>
      </div>
      <div class="w-full flex justify-end gap-2 px-2">
        <UButtonGroup v-if="isCalendarPage" size="xs" :ui="buttonGroupUI">
          <transition name="grow-shrink" mode="out-in">
            <UInput v-if="showingSearchInput" v-model="searchValue" placeholder="Search for events..." />
          </transition>
          <UButton @click="showingSearchInput = !showingSearchInput" class="transition-all z-10" icon="i-heroicons-magnifying-glass-16-solid" />
        </UButtonGroup>
        <UButton square color="primary" size="xs" variant="outline" icon="i-heroicons-moon-16-solid" />
      </div>
    </header>
    <div ref="headerSpacerHolderElement" class="header-space-holder" style="height: 36px;">
    </div>
  </div>
</template>
<script setup lang="ts">
const headerElement = ref<HTMLElement | null>(null);
const headerSpacerHolderElement = ref<HTMLElement | null>(null);

const showingSearchInput = ref(false);
const searchStore = useSearchStore();
const { searchValue } = storeToRefs(searchStore);

watchEffect(() => {
  if (showingSearchInput.value) {
    searchValue.value = '';
  }
});

const items = [[
  {
    label: 'Home',
    to: '/',
    icon: 'i-heroicons-home-16-solid',
  },
  {
    label: 'Config data',
    to: '/setup',
    icon: 'i-heroicons-cog-16-solid',
  },
  {
    label: 'About',
    to: '/about',
    icon: 'i-heroicons-information-circle-16-solid',
  },
]];

const buttonGroupUI = {
  orientation: {
    'rounded-md': {
      horizontal: {
        start: 'rounded-e-md rounded-s-none',
        end: 'rounded-s-md rounded-e-none'
      }
    }
  }
};

const route = useRoute();
const isCalendarPage = computed(() => route.name === 'calendar');

const resetHeaderSpacerHeight = () => {
  if (!headerSpacerHolderElement.value || !headerElement.value) {
    return;
  }
  headerSpacerHolderElement.value.style.height = `${headerElement.value.clientHeight}px`;
};
onMounted(resetHeaderSpacerHeight);
onUpdated(resetHeaderSpacerHeight);
</script>
<style lang="scss">
.header-container {
  @apply
    mb-3
  ;
}
.header {
  @apply
    fixed
    z-20
    top-0
    left-0
    w-full
    grid
    grid-cols-[1fr_max-content_1fr]
    items-center
    justify-items-center
    mb-6
    py-1
    bg-slate-50 dark:bg-slate-950
    shadow-sm dark:shadow-none
  ;
  h1 {
    @apply
      text-lg
      font-semibold
      text-slate-800
      tracking-wide
      text-center
      justify-self-center
      flex
      items-center
      justify-center
      gap-2
      relative
    ;
    .logo {
      @apply
        absolute
        -right-6
      ;
    }
  }
}
.grow-shrink-enter-from, .grow-shrink-leave-to {
  // z-index: 0;
  width: 0;
  opacity: 0;
}
.grow-shrink-enter-to, .grow-shrink-leave-from {
  width: 165px;
  opacity: 1;
}
.grow-shrink-enter-active, .grow-shrink-leave-active {
  transition: all 0.3s ease;
}
</style>
