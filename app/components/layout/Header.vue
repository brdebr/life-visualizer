<template>
  <div class="header-container">
    <header class="header">
      <div class="left-menu-container">
        <UDropdownMenu
          :items
          :content="{
            align: 'start',
            side: 'bottom',
          }"
        >
          <UButton
            square
            color="primary"
            size="sm"
            variant="outline"
            icon="i-heroicons-bars-3-16-solid"
          />
        </UDropdownMenu>
      </div>
      <div class="logo-container">
        <h1 class="header-logo">
          <span>
            Life Visualizer
          </span>
          <img
            class="logo"
            src="/logo-icon-bg.png"
            alt="logo"
            width="12"
            height="12"
          >
        </h1>
      </div>
      <div class="right-menu-container" />
    </header>
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const items = ref<DropdownMenuItem[][]>([[
  {
    label: 'Home',
    to: '/',
    icon: 'i-heroicons-home-16-solid',
  },
  // {
  //   label: 'Events',
  //   to: '/events',
  //   icon: 'i-heroicons-calendar-16-solid',
  // },
  // {
  //   label: 'Categories',
  //   to: '/categories',
  //   icon: 'i-heroicons-tag-16-solid',
  // },
  // {
  //   label: 'Periods',
  //   to: '/periods',
  //   icon: 'i-heroicons-calendar-16-solid',
  // },
  // {
  //   label: 'Config data',
  //   to: '/setup',
  //   icon: 'i-heroicons-cog-16-solid',
  // },
  // {
  //   label: 'About',
  //   to: '/about',
  //   icon: 'i-heroicons-information-circle-16-solid',
  // },
]])
</script>

<style>
@reference '@/assets/styles/global.css';

.header {
  @apply
    grid
    grid-cols-[1fr_max-content_1fr]
    py-1
    px-2.5
    bg-slate-50 dark:bg-slate-950
  ;
  .header-logo {
    @apply
      flex
      items-center justify-center
      gap-2
      text-lg
      font-semibold
      text-slate-800
      dark:text-slate-200
      tracking-wide
    ;
  }
}
</style>
