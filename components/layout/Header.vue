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
          <img class="logo" src="/logo-icon-bg.png" alt="logo" width="14" height="14" />
        </h1>
      </div>
      <div class="w-full flex justify-end gap-2 px-2">
        <UButton square color="primary" size="xs" variant="outline" icon="i-heroicons-magnifying-glass-16-solid" />
        <UButton square color="primary" size="xs" variant="outline" icon="i-heroicons-moon-16-solid" />
      </div>
    </header>
    <div ref="headerSpacerHolderElement" class="header-space-holder" style="height: 37px;">
    </div>
  </div>
</template>
<script setup lang="ts">
const headerElement = ref<HTMLElement | null>(null);
const headerSpacerHolderElement = ref<HTMLElement | null>(null);

const items = [[
  {
    label: 'Home',
    to: '/'
  },
  {
    label: 'Config data',
    to: '/setup',
  },
  {
    label: 'Life calendar',
    to: '/calendar',
    disabled: true
  },
  {
    label: 'About',
    to: '/about',
  },
]];

const resetHeaderSpacerHeight = () => {
  if (headerSpacerHolderElement.value) {
    headerSpacerHolderElement.value.style.height = `${headerElement.value?.clientHeight || 37}px`;
  }
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
    top-0
    left-0
    w-full
    grid
    grid-cols-[1fr_max-content_1fr]
    items-center
    justify-items-center
    mb-6
    px-1 pt-1 pb-[5px]
    bg-slate-50 dark:bg-slate-950
    shadow-sm dark:shadow-none
  ;
  h1 {
    @apply
      text-xl
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
        ml-3
      ;
    }
  }
}

</style>
